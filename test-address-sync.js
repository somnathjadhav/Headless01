#!/usr/bin/env node

/**
 * Address Sync Test Script
 * Tests the address synchronization functionality
 */

const fetch = globalThis.fetch || require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_USER_ID = '1'; // Change this to a valid user ID

async function testAddressSync() {
  console.log('🧪 Testing Address Sync Functionality');
  console.log('=====================================');
  
  try {
    // Test 1: Get addresses
    console.log('\n1️⃣ Testing GET addresses...');
    const getResponse = await fetch(`${BASE_URL}/api/user/addresses?userId=${TEST_USER_ID}`);
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ GET addresses successful');
      console.log('📊 Addresses found:', getData.addresses?.length || 0);
      console.log('📝 Source:', getData.source || 'unknown');
      console.log('💬 Message:', getData.message);
    } else {
      console.log('❌ GET addresses failed:', getData.message);
      return;
    }
    
    // Test 2: Update an address (if addresses exist)
    if (getData.addresses && getData.addresses.length > 0) {
      const addressToUpdate = getData.addresses[0];
      console.log('\n2️⃣ Testing UPDATE address...');
      console.log('📝 Updating address:', addressToUpdate.id, addressToUpdate.type);
      
      const updateData = {
        ...addressToUpdate,
        street: addressToUpdate.street + ' (Updated)',
        city: addressToUpdate.city + ' (Updated)'
      };
      
      const updateResponse = await fetch(`${BASE_URL}/api/user/addresses`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID,
        },
        body: JSON.stringify(updateData)
      });
      
      const updateResult = await updateResponse.json();
      
      if (updateResponse.ok) {
        console.log('✅ UPDATE address successful');
        console.log('📝 Message:', updateResult.message);
        console.log('📊 Updated address:', updateResult.address);
      } else {
        console.log('❌ UPDATE address failed:', updateResult.message);
      }
      
      // Test 3: Verify the update by getting addresses again
      console.log('\n3️⃣ Testing GET addresses after update...');
      const verifyResponse = await fetch(`${BASE_URL}/api/user/addresses?userId=${TEST_USER_ID}`);
      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.ok) {
        console.log('✅ GET addresses after update successful');
        console.log('📊 Addresses found:', verifyData.addresses?.length || 0);
        
        // Check if the update was persisted
        const updatedAddress = verifyData.addresses.find(addr => addr.id === addressToUpdate.id);
        if (updatedAddress && updatedAddress.street.includes('(Updated)')) {
          console.log('✅ Address update was persisted successfully!');
        } else {
          console.log('⚠️ Address update may not have been persisted');
        }
      } else {
        console.log('❌ GET addresses after update failed:', verifyData.message);
      }
    } else {
      console.log('\n2️⃣ Skipping UPDATE test - no addresses found');
    }
    
    // Test 4: Test address sync endpoint
    console.log('\n4️⃣ Testing address sync endpoint...');
    const syncResponse = await fetch(`${BASE_URL}/api/user/addresses/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID,
      },
      body: JSON.stringify({
        addresses: getData.addresses || []
      })
    });
    
    const syncData = await syncResponse.json();
    
    if (syncResponse.ok) {
      console.log('✅ Address sync successful');
      console.log('📝 Message:', syncData.message);
      console.log('📊 Source:', syncData.source);
    } else {
      console.log('❌ Address sync failed:', syncData.message);
    }
    
    console.log('\n🎉 Address sync testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('💡 Make sure your Next.js server is running on', BASE_URL);
  }
}

// Run the test
if (require.main === module) {
  testAddressSync();
}

module.exports = { testAddressSync };
