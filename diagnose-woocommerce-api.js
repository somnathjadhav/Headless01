#!/usr/bin/env node

/**
 * WooCommerce API Diagnostic Script
 * Diagnoses WooCommerce API permission issues
 */

const fetch = globalThis.fetch || require('node-fetch');

// Use hardcoded values from .env.local for diagnosis
const WORDPRESS_URL = 'http://woocommerce.local';
const CONSUMER_KEY = 'ck_609af559e29fe87aff4bf1137d0aa9b8019c40b6';
const CONSUMER_SECRET = 'cs_54eb331143c9e80a6b19e58bcf3ecf0c7dadf4cf';

async function diagnoseWooCommerceAPI() {
  console.log('🔍 WooCommerce API Diagnostic');
  console.log('=============================');
  
  // Check environment variables
  console.log('\n📋 Environment Check:');
  console.log(`WordPress URL: ${WORDPRESS_URL}`);
  console.log(`Consumer Key: ${CONSUMER_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`Consumer Secret: ${CONSUMER_SECRET ? '✅ Set' : '❌ Missing'}`);
  
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    console.log('\n❌ Missing API credentials. Please check your .env.local file.');
    return;
  }
  
  // Create authorization header
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  
  console.log('\n🔐 API Credentials:');
  console.log(`Consumer Key: ${CONSUMER_KEY.substring(0, 10)}...`);
  console.log(`Consumer Secret: ${CONSUMER_SECRET.substring(0, 10)}...`);
  
  // Test 1: Check if WooCommerce API is accessible
  console.log('\n1️⃣ Testing WooCommerce API Accessibility...');
  try {
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/system_status`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ WooCommerce API is accessible');
    } else {
      console.log(`❌ WooCommerce API error: ${response.status} ${response.statusText}`);
      const errorData = await response.json();
      console.log('Error details:', errorData);
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
  
  // Test 2: Check customer read permissions
  console.log('\n2️⃣ Testing Customer Read Permissions...');
  try {
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/customers/1`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const customerData = await response.json();
      console.log('✅ Customer read permissions: OK');
      console.log(`Customer ID: ${customerData.id}`);
      console.log(`Customer Email: ${customerData.email || 'Not set'}`);
      console.log(`Customer Name: ${customerData.first_name || ''} ${customerData.last_name || ''}`);
    } else {
      console.log(`❌ Customer read error: ${response.status} ${response.statusText}`);
      const errorData = await response.json();
      console.log('Error details:', errorData);
      
      if (response.status === 401) {
        console.log('\n💡 Solution: The API key needs "Read" permissions for customers');
      }
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
  
  // Test 3: Check customer write permissions
  console.log('\n3️⃣ Testing Customer Write Permissions...');
  try {
    const testData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com'
    };
    
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/customers/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      console.log('✅ Customer write permissions: OK');
    } else {
      console.log(`❌ Customer write error: ${response.status} ${response.statusText}`);
      const errorData = await response.json();
      console.log('Error details:', errorData);
      
      if (response.status === 401) {
        console.log('\n💡 Solution: The API key needs "Read/Write" permissions for customers');
      } else if (response.status === 403) {
        console.log('\n💡 Solution: The API key user needs proper WordPress role (WooCommerce Manager or Administrator)');
      }
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
  
  // Test 4: Check WordPress users
  console.log('\n4️⃣ Testing WordPress User Access...');
  try {
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users`);
    
    if (response.ok) {
      const users = await response.json();
      console.log('✅ WordPress users accessible');
      console.log('Available users:');
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Name: ${user.name}, Username: ${user.username || 'N/A'}`);
      });
    } else {
      console.log(`❌ WordPress users error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
  
  // Summary and recommendations
  console.log('\n📋 Summary & Recommendations:');
  console.log('=============================');
  console.log('1. Check WooCommerce → Settings → Advanced → REST API');
  console.log('2. Ensure API key has "Read/Write" permissions');
  console.log('3. Ensure API key user has "WooCommerce Manager" or "Administrator" role');
  console.log('4. Test with a new API key if current one cannot be updated');
  console.log('5. Update .env.local with new credentials if needed');
  
  console.log('\n🎯 Expected Result:');
  console.log('All tests should show ✅ for proper address synchronization');
}

diagnoseWooCommerceAPI().catch(console.error);
