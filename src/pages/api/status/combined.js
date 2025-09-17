/**
 * Combined Status API Endpoint
 * Optimized to check both WordPress and WooCommerce in a single request
 */

import requestDeduplication from '../../../lib/requestDeduplication';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
    
    if (!wordpressUrl) {
      return res.status(200).json({
        success: false,
        message: 'WordPress URL not configured',
        data: {
          wordpress: { status: 'error', message: 'Not configured' },
          woocommerce: { status: 'error', message: 'Not configured' }
        }
      });
    }

    // Make parallel requests to both APIs with deduplication
    const [wpResult, wcResult] = await Promise.allSettled([
      // WordPress check with deduplication
      requestDeduplication.deduplicate(`${wordpressUrl}/wp-json/wp/v2/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }),
      
      // WooCommerce check with deduplication (only if credentials are available)
      consumerKey && consumerSecret ? 
        requestDeduplication.deduplicate(`${wordpressUrl}/wp-json/wc/v3/`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }) : 
        Promise.resolve({ ok: false, status: 401 })
    ]);

    // Process WordPress result
    let wordpressStatus = { status: 'offline', message: 'Offline' };
    if (wpResult.status === 'fulfilled' && wpResult.value.ok) {
      wordpressStatus = { status: 'online', message: 'Online' };
    } else if (wpResult.status === 'fulfilled' && wpResult.value.status === 429) {
      wordpressStatus = { status: 'online', message: 'Online (Rate Limited)' };
    } else if (wpResult.status === 'rejected') {
      wordpressStatus = { status: 'offline', message: 'Connection Failed' };
    }

    // Process WooCommerce result
    let woocommerceStatus = { status: 'offline', message: 'Offline' };
    if (!consumerKey || !consumerSecret) {
      woocommerceStatus = { status: 'error', message: 'API Keys Not Configured' };
    } else if (wcResult.status === 'fulfilled' && wcResult.value.ok) {
      woocommerceStatus = { status: 'online', message: 'Online' };
    } else if (wcResult.status === 'fulfilled' && wcResult.value.status === 401) {
      woocommerceStatus = { status: 'error', message: 'Invalid API Keys' };
    } else if (wcResult.status === 'fulfilled' && wcResult.value.status === 429) {
      woocommerceStatus = { status: 'online', message: 'Online (Rate Limited)' };
    } else if (wcResult.status === 'rejected') {
      woocommerceStatus = { status: 'offline', message: 'Connection Failed' };
    }

    // Set cache headers for 30 seconds
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return res.status(200).json({
      success: true,
      message: 'Status check completed',
      data: {
        wordpress: wordpressStatus,
        woocommerce: woocommerceStatus,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Combined status check error:', error);
    return res.status(200).json({
      success: false,
      message: 'Status check failed',
      error: error.message,
      data: {
        wordpress: { status: 'error', message: 'Check Failed' },
        woocommerce: { status: 'error', message: 'Check Failed' }
      }
    });
  }
}
