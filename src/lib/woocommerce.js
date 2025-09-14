import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

/**
 * WooCommerce REST API Client
 */
export function createWooCommerceClient() {
  const url = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:10008';
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_test';
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_test';
  
  console.log('WooCommerce API Config:', {
    url,
    consumerKey: consumerKey ? '***' + consumerKey.slice(-4) : 'NOT SET',
    consumerSecret: consumerSecret ? '***' + consumerSecret.slice(-4) : 'NOT SET',
    consumerKeyLength: consumerKey.length,
    consumerSecretLength: consumerSecret.length
  });
  
  // For local development, allow fallback credentials
  if (!consumerKey || !consumerSecret || consumerKey === 'ck_test') {
    console.log('⚠️  Using fallback WooCommerce credentials for local development');
  }
  
  try {
    const client = new WooCommerceRestApi({
      url,
      consumerKey,
      consumerSecret,
      version: 'wc/v3',
      queryStringAuth: false, // Use header authentication instead
    });
    
    console.log('WooCommerce client created successfully');
    return client;
  } catch (error) {
    console.error('Error creating WooCommerce client:', error);
    throw error;
  }
}

/**
 * WooCommerce API Wrapper
 */
export const wooCommerceAPI = {
  /**
   * Get all products
   */
  async getProducts(params = {}) {
    try {
      console.log('WooCommerce getProducts called with params:', params);
      const client = createWooCommerceClient();
      console.log('Making API request to WooCommerce...');
      const response = await client.get('products', {
        per_page: params.per_page || 12,
        page: params.page || 1,
        category: params.category || '',
        search: params.search || '',
        orderby: params.orderby || 'date',
        order: params.order || 'desc',
        status: 'publish',
        ...params
      });
      
      console.log('WooCommerce API response:', {
        productsCount: response.data?.length || 0,
        totalPages: response.headers['x-wp-totalpages'],
        total: response.headers['x-wp-total']
      });
      
      return {
        products: response.data,
        totalPages: parseInt(response.headers['x-wp-totalpages']),
        total: parseInt(response.headers['x-wp-total'])
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        stack: error.stack
      });
      return { products: [], totalPages: 0, total: 0 };
    }
  },

  /**
   * Get a single product by ID
   */
  async getProduct(productId) {
    try {
      const client = createWooCommerceClient();
      const response = await client.get(`products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  /**
   * Get product categories
   */
  async getCategories(params = {}) {
    try {
      const client = createWooCommerceClient();
      const response = await client.get('products/categories', {
        per_page: params.per_page || 100,
        page: params.page || 1,
        orderby: params.orderby || 'name',
        order: params.order || 'asc',
        hide_empty: params.hide_empty || true,
        ...params
      });
      
      return {
        categories: response.data,
        totalPages: parseInt(response.headers['x-wp-totalpages']),
        total: parseInt(response.headers['x-wp-total'])
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { categories: [], totalPages: 0, total: 0 };
    }
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId, params = {}) {
    try {
      const client = createWooCommerceClient();
      const response = await client.get('products', {
        category: categoryId,
        per_page: params.per_page || 12,
        page: params.page || 1,
        orderby: params.orderby || 'date',
        order: params.order || 'desc',
        status: 'publish',
        ...params
      });
      
      return {
        products: response.data,
        totalPages: parseInt(response.headers['x-wp-totalpages']),
        total: parseInt(response.headers['x-wp-total'])
      };
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return { products: [], totalPages: 0, total: 0 };
    }
  },

  /**
   * Search products
   */
  async searchProducts(searchTerm, params = {}) {
    try {
      const client = createWooCommerceClient();
      const response = await client.get('products', {
        search: searchTerm,
        per_page: params.per_page || 12,
        page: params.page || 1,
        orderby: params.orderby || 'relevance',
        order: params.order || 'desc',
        status: 'publish',
        ...params
      });
      
      return {
        products: response.data,
        totalPages: parseInt(response.headers['x-wp-totalpages']),
        total: parseInt(response.headers['x-wp-total'])
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return { products: [], totalPages: 0, total: 0 };
    }
  },

  /**
   * Get product variations (for variable products)
   */
  async getProductVariations(productId, params = {}) {
    try {
      const client = createWooCommerceClient();
      const response = await client.get(`products/${productId}/variations`, {
        per_page: params.per_page || 100,
        page: params.page || 1,
        ...params
      });
      
      return {
        variations: response.data,
        totalPages: parseInt(response.headers['x-wp-totalpages']),
        total: parseInt(response.headers['x-wp-total'])
      };
    } catch (error) {
      console.error('Error fetching product variations:', error);
      return { variations: [], totalPages: 0, total: 0 };
    }
  },

  /**
   * Get product attributes
   */
  async getProductAttributes(params = {}) {
    try {
      const client = createWooCommerceClient();
      const response = await client.get('products/attributes', {
        per_page: params.per_page || 100,
        page: params.page || 1,
        ...params
      });
      
      return {
        attributes: response.data,
        totalPages: parseInt(response.headers['x-wp-totalpages']),
        total: parseInt(response.headers['x-wp-total'])
      };
    } catch (error) {
      console.error('Error fetching product attributes:', error);
      return { attributes: [], totalPages: 0, total: 0 };
    }
  },

  /**
   * Get product reviews
   */
  async getProductReviews(productId, params = {}) {
    try {
      const client = createWooCommerceClient();
      const response = await client.get(`products/reviews`, {
        product: productId,
        per_page: params.per_page || 12,
        page: params.page || 1,
        orderby: params.orderby || 'date',
        order: params.order || 'desc',
        status: 'approved',
        ...params
      });
      
      return {
        reviews: response.data,
        totalPages: parseInt(response.headers['x-wp-totalpages']),
        total: parseInt(response.headers['x-wp-total'])
      };
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return { reviews: [], totalPages: 0, total: 0 };
    }
  },

  /**
   * Create a product review
   */
  async createProductReview(reviewData) {
    try {
      const client = createWooCommerceClient();
      const response = await client.post('products/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating product review:', error);
      throw error;
    }
  },

  /**
   * Generic POST method for WooCommerce API
   */
  async post(endpoint, data) {
    try {
      const client = createWooCommerceClient();
      const response = await client.post(endpoint, data);
      return response;
    } catch (error) {
      console.error(`Error making POST request to ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Generic GET method for WooCommerce API
   */
  async get(endpoint, params = {}) {
    try {
      const client = createWooCommerceClient();
      const response = await client.get(endpoint, params);
      return response;
    } catch (error) {
      console.error(`Error making GET request to ${endpoint}:`, error);
      throw error;
    }
  }
};

/**
 * Utility functions for WooCommerce data
 */
export const wooCommerceUtils = {
  /**
   * Format product price
   */
  formatPrice(price, currency = 'USD') {
    if (!price) return '';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });
    
    return formatter.format(price);
  },

  /**
   * Get product image URL
   */
  getProductImage(product, size = 'medium') {
    if (!product || !product.images || product.images.length === 0) {
      return '/placeholder-product.svg';
    }
    
    const image = product.images[0];
    return image[size] || image.src || image.url;
  },

  /**
   * Check if product is on sale
   */
  isProductOnSale(product) {
    return product.sale_price && product.sale_price !== '';
  },

  /**
   * Get product discount percentage
   */
  getDiscountPercentage(product) {
    if (!this.isProductOnSale(product)) return 0;
    
    const regularPrice = parseFloat(product.regular_price);
    const salePrice = parseFloat(product.sale_price);
    
    if (regularPrice <= 0) return 0;
    
    return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
  },

  /**
   * Get product stock status
   */
  getStockStatus(product) {
    if (product.stock_status === 'instock') return 'In Stock';
    if (product.stock_status === 'outofstock') return 'Out of Stock';
    if (product.stock_status === 'onbackorder') return 'On Backorder';
    return 'Unknown';
  }
};
