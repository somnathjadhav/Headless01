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
    const { id } = req.query;
    const { page = 1, per_page = 10, orderby = 'date', order = 'desc' } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Create WooCommerce client
    const client = new WooCommerceRestApi({
      url: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://staging.eternitty.com/headless-woo',
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
      version: 'wc/v3',
      queryStringAuth: false,
    });

    // Fetch product reviews
    const response = await client.get('products/reviews', {
      product: id,
      per_page: parseInt(per_page),
      page: parseInt(page),
      orderby,
      order,
      status: 'approved'
    });

    const reviews = response.data || [];
    const totalPages = parseInt(response.headers['x-wp-totalpages']) || 0;
    const total = parseInt(response.headers['x-wp-total']) || 0;

    // Format reviews data
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      date_created: review.date_created,
      date_created_gmt: review.date_created_gmt,
      product_id: review.product_id,
      product_name: review.product_name,
      status: review.status,
      reviewer: review.reviewer,
      reviewer_email: review.reviewer_email,
      review: review.review,
      rating: review.rating,
      verified: review.verified,
      reviewer_avatar_urls: review.reviewer_avatar_urls
    }));

    return res.status(200).json({
      reviews: formattedReviews,
      totalPages,
      total,
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error('Error fetching product reviews:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        message: 'Product not found',
        reviews: [],
        totalPages: 0,
        total: 0
      });
    }

    return res.status(500).json({ 
      message: 'Failed to fetch product reviews',
      error: error.message,
      reviews: [],
      totalPages: 0,
      total: 0
    });
  }
}

