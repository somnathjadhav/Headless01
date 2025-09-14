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

    // Make API request to WooCommerce
    const response = await client.get('products/categories', {
      per_page: parseInt(per_page),
      page: parseInt(page),
      orderby: orderby || 'name',
      order: order || 'asc',
      hide_empty: hide_empty === 'true',
    });

    // Return the data
    res.status(200).json({
      categories: response.data,
      totalPages: parseInt(response.headers['x-wp-totalpages']),
      total: parseInt(response.headers['x-wp-total'])
    });

  } catch (error) {
    console.error('Error in categories API route:', error);
    
    // Provide fallback categories when WooCommerce is not configured
    console.log('⚠️ WooCommerce not configured, providing fallback categories');
    
    const fallbackCategories = [
      { id: 1, name: 'Electronics', slug: 'electronics', count: 12, description: 'Latest electronic devices' },
      { id: 2, name: 'Clothing', slug: 'clothing', count: 8, description: 'Fashion and apparel' },
      { id: 3, name: 'Home & Garden', slug: 'home-garden', count: 15, description: 'Home improvement and garden supplies' },
      { id: 4, name: 'Sports', slug: 'sports', count: 6, description: 'Sports and fitness equipment' },
      { id: 5, name: 'Books', slug: 'books', count: 20, description: 'Books and educational materials' }
    ];
    
    res.status(200).json({
      categories: fallbackCategories,
      totalPages: 1,
      total: fallbackCategories.length,
      source: 'fallback'
    });
  }
}
