/**
 * Test WooCommerce API Endpoints
 * Run this with: node test-woocommerce.js
 */

const WORDPRESS_URL = 'https://woo.local';

async function testWooCommerceEndpoints() {
  console.log('🔍 Testing WooCommerce API Endpoints...\n');
  
  const endpoints = [
    '/wp-json/wc/v3/',
    '/wp-json/wc/v3/products',
    '/wp-json/wc/v3/system_status',
    '/wp-json/wc/v3/products/categories',
    '/wp-json/wc/v3/orders'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${WORDPRESS_URL}${endpoint}`);
      const status = response.status;
      const statusText = response.statusText;
      
      console.log(`${endpoint}:`);
      console.log(`  Status: ${status} ${statusText}`);
      
      if (response.ok) {
        try {
          const data = await response.json();
          if (Array.isArray(data)) {
            console.log(`  Data: Array with ${data.length} items`);
          } else if (typeof data === 'object') {
            console.log(`  Data: Object with keys: ${Object.keys(data).join(', ')}`);
          } else {
            console.log(`  Data: ${typeof data}`);
          }
        } catch (parseError) {
          console.log(`  Data: Could not parse JSON`);
        }
      } else {
        console.log(`  Error: ${statusText}`);
      }
      console.log('');
    } catch (error) {
      console.log(`${endpoint}:`);
      console.log(`  Error: ${error.message}`);
      console.log('');
    }
  }
}

// Run the test
testWooCommerceEndpoints().catch(console.error);
