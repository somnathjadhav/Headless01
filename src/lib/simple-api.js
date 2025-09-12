/**
 * Simple, Secure API Client
 * Performance and security focused
 */

// Environment validation
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

// Security: Validate environment variables
if (!WORDPRESS_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
  throw new Error('Missing required environment variables for WooCommerce API');
}

// Security: Validate URL format
if (!WORDPRESS_URL.startsWith('https://')) {
  throw new Error('WordPress URL must use HTTPS for security');
}

// Performance: Create reusable headers
const createAuthHeaders = () => ({
  'Authorization': `Basic ${btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`)}`,
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=300' // 5 minutes cache
});

// Performance: Simple fetch wrapper with error handling
const secureFetch = async (endpoint, options = {}) => {
  const url = `${WORDPRESS_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...createAuthHeaders(),
        ...options.headers
      }
    });

    // Security: Validate response
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// WooCommerce API functions
export const api = {
  // Get products with pagination
  getProducts: async (page = 1, perPage = 12) => {
    return secureFetch(`/wp-json/wc/v3/products?page=${page}&per_page=${perPage}`);
  },

  // Get single product
  getProduct: async (id) => {
    return secureFetch(`/wp-json/wc/v3/products/${id}`);
  },

  // Get categories
  getCategories: async () => {
    return secureFetch('/wp-json/wc/v3/products/categories');
  },

  // Search products
  searchProducts: async (query, page = 1) => {
    const encodedQuery = encodeURIComponent(query);
    return secureFetch(`/wp-json/wc/v3/products?search=${encodedQuery}&page=${page}`);
  }
};

// Security: Export only what's needed
export default api;
