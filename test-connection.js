// Test script to check backend connection
// Ignore SSL certificate issues for local development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const WORDPRESS_URL = 'https://woo.local';
const FRONTEND_URL = 'http://localhost:3000';

async function testBackendConnection() {
  console.log('🔍 Testing Backend Connection...\n');
  
  try {
    // Test WordPress REST API
    console.log('1. Testing WordPress REST API...');
    const wpResponse = await fetch(`${WORDPRESS_URL}/wp-json/`);
    
    if (wpResponse.ok) {
      const wpData = await wpResponse.json();
      console.log('✅ WordPress REST API is accessible');
      console.log('   - Name:', wpData.name);
      console.log('   - Description:', wpData.description);
      console.log('   - Version:', wpData.version);
    } else {
      console.log('❌ WordPress REST API is not accessible');
      console.log('   - Status:', wpResponse.status);
      console.log('   - Status Text:', wpResponse.statusText);
    }
  } catch (error) {
    console.log('❌ WordPress REST API connection failed');
    console.log('   - Error:', error.message);
  }
  
  console.log('\n2. Testing WooCommerce REST API...');
  try {
    const wcResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/products`);
    
    if (wcResponse.ok) {
      console.log('✅ WooCommerce REST API is accessible');
    } else {
      console.log('⚠️  WooCommerce REST API requires authentication');
      console.log('   - Status:', wcResponse.status);
      console.log('   - Message: This is normal - WooCommerce needs API keys');
    }
  } catch (error) {
    console.log('❌ WooCommerce REST API connection failed');
    console.log('   - Error:', error.message);
  }
  
  console.log('\n3. Testing Frontend...');
  try {
    const frontendResponse = await fetch(FRONTEND_URL);
    
    if (frontendResponse.ok) {
      console.log('✅ Frontend is accessible');
    } else {
      console.log('❌ Frontend is not accessible');
      console.log('   - Status:', frontendResponse.status);
    }
  } catch (error) {
    console.log('❌ Frontend connection failed');
    console.log('   - Error:', error.message);
  }
  
  console.log('\n📋 Connection Summary:');
  console.log('   - Backend URL:', WORDPRESS_URL);
  console.log('   - Frontend URL:', FRONTEND_URL);
  console.log('   - Environment:', process.env.NODE_ENV || 'development');
}

testBackendConnection();
