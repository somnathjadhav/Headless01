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

    if (!id) {
      return res.status(400).json({ message: 'Product ID or slug is required' });
    }

    // Create WooCommerce client on server side
    const client = new WooCommerceRestApi({
      url: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://staging.eternitty.com/headless-woo',
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
      version: 'wc/v3',
      queryStringAuth: false,
    });

    let response;

    // Check if id is numeric (product ID) or string (product slug)
    if (isNaN(id)) {
      // Search by slug
      const searchResponse = await client.get('products', {
        slug: id,
        per_page: 1
      });
      
      if (searchResponse.data && searchResponse.data.length > 0) {
        response = { data: searchResponse.data[0] };
      } else {
        return res.status(404).json({ 
          message: 'Product not found',
          error: 'Product with this slug does not exist' 
        });
      }
    } else {
      // Search by ID
      response = await client.get(`products/${id}`);
    }

    // If this is a variable product, fetch the full variation data
    if (response.data.type === 'variable' && response.data.variations && response.data.variations.length > 0) {
      try {
        const variationPromises = response.data.variations.map(variationId => 
          client.get(`products/${response.data.id}/variations/${variationId}`)
        );
        
        const variationResponses = await Promise.all(variationPromises);
        const fullVariations = variationResponses.map(variationResponse => variationResponse.data);
        
        // Replace the variation IDs with full variation objects
        response.data.variations = fullVariations;
      } catch (variationError) {
        console.error('Error fetching variations:', variationError);
        // Keep the original variation IDs if fetching fails
      }
    }

    // Return the data
    res.status(200).json(response.data);

  } catch (error) {
    console.error('Error in single product API route:', error);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ 
        message: 'Product not found',
        error: 'The requested product does not exist' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error fetching product',
      error: error.message 
    });
  }
}
