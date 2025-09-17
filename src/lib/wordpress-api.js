/**
 * WordPress API Client
 */
export const wpClient = {
  async getSiteInfo() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/eternitty/v1/info`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching site info:', error);
      return null;
    }
  },

  async getPosts(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        per_page: params.per_page || 10,
        page: params.page || 1,
        ...params
      });
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/posts?${queryParams}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  async getPost(slug) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/posts?slug=${slug}`
      );
      const posts = await response.json();
      return posts[0] || null;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  },

  async getCategories() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/categories`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
};

/**
 * GraphQL Client
 */
export const graphqlClient = {
  async query(query, variables = {}) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('GraphQL query error:', error);
      return { data: null, errors: [error.message] };
    }
  }
};

/**
 * Utility function to check if WordPress is accessible
 */
export async function checkWordPressConnection() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/`);
    return response.ok;
  } catch (error) {
    console.error('WordPress connection check failed:', error);
    return false;
  }
}

/**
 * Utility function to check if WooCommerce is active
 */
export async function checkWooCommerceStatus() {
  try {
    // First try the authenticated WooCommerce REST API
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products`);
    
    if (response.ok) {
      return true;
    }
    
    // Fallback: Check if WooCommerce is active by looking for WooCommerce-related data in WordPress
    const wpResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/product`);
    
    if (wpResponse.ok) {
      return true;
    }
    
    // Alternative: Check if WooCommerce taxonomies exist
    const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/product_cat`);
    if (categoriesResponse.ok) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('WooCommerce status check failed:', error);
    return false;
  }
}
