/**
 * Client-Safe API Client
 * Calls Next.js API routes instead of WooCommerce directly
 */

// Client-safe API functions that call our Next.js API routes
export const clientApi = {
  // Get products with pagination
  getProducts: async (page = 1, perPage = 12) => {
    try {
      const response = await fetch(`/api/products?page=${page}&per_page=${perPage}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Client API Error:', error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (id) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Client API Error:', error);
      throw error;
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Client API Error:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query, page = 1) => {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(`/api/products?search=${encodedQuery}&page=${page}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Client API Error:', error);
      throw error;
    }
  }
};

export default clientApi;
