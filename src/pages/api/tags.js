import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export default async function handler(req, res) {
  // Disable SSL verification for local development
  if (process.env.NEXT_PUBLIC_WORDPRESS_URL?.includes('woo.local')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create WooCommerce client on server side
    const client = new WooCommerceRestApi({
      url: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://staging.eternitty.com/headless-woo',
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
      version: 'wc/v3',
      queryStringAuth: false,
    });

    // Get query parameters
    const { per_page = 100, page = 1, orderby = 'name', order = 'asc', hide_empty = true } = req.query;

    // Make API request to WooCommerce for product tags
    const response = await client.get('products/tags', {
      per_page: parseInt(per_page),
      page: parseInt(page),
      orderby: orderby || 'name',
      order: order || 'asc',
      hide_empty: hide_empty === 'true',
    });

    // Return the data
    res.status(200).json({
      tags: response.data,
      totalPages: parseInt(response.headers['x-wp-totalpages']),
      total: parseInt(response.headers['x-wp-total'])
    });

  } catch (error) {
    console.error('Error in tags API route:', error);
    res.status(500).json({ 
      message: 'Error fetching tags',
      error: error.message 
    });
  }
}
