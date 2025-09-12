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
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ message: 'Tag slug is required' });
    }

    // Create WooCommerce client on server side
    const client = new WooCommerceRestApi({
      url: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://staging.eternitty.com/headless-woo',
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
      version: 'wc/v3',
      queryStringAuth: false,
    });

    // Get query parameters for products
    const { 
      page = 1, 
      per_page = 12, 
      orderby = 'date', 
      order = 'desc',
      min_price = '',
      max_price = '',
      on_sale = '',
      featured = ''
    } = req.query;

    // First, get the tag information
    const tagResponse = await client.get('products/tags', {
      slug: slug,
      per_page: 1
    });

    if (!tagResponse.data || tagResponse.data.length === 0) {
      return res.status(404).json({ 
        message: 'Tag not found',
        error: 'Tag with this slug does not exist' 
      });
    }

    const tag = tagResponse.data[0];

    // Build query parameters for products
    const params = {
      page: parseInt(page),
      per_page: parseInt(per_page),
      orderby,
      order,
      tag: tag.id
    };

    // Add price range parameters if provided
    if (min_price) {
      params.min_price = min_price;
    }
    if (max_price) {
      params.max_price = max_price;
    }

    // Add on_sale parameter if provided
    if (on_sale === 'true') {
      params.on_sale = true;
    }

    // Add featured parameter if provided
    if (featured === 'true') {
      params.featured = true;
    }

    // Fetch products with this tag
    const productsResponse = await client.get('products', params);

    // Return the data
    res.status(200).json({
      tag,
      products: productsResponse.data,
      totalPages: parseInt(productsResponse.headers['x-wp-totalpages']),
      total: parseInt(productsResponse.headers['x-wp-total']),
      currentPage: parseInt(page),
      perPage: parseInt(per_page)
    });

  } catch (error) {
    console.error('Error in tag products API route:', error);
    res.status(500).json({ 
      message: 'Error fetching tag products',
      error: error.message 
    });
  }
}
