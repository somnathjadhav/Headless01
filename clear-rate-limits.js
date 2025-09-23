#!/usr/bin/env node

/**
 * Clear Rate Limits Script
 * Development utility to clear rate limits via command line
 */

// Use built-in fetch in Node.js 18+ or import node-fetch for older versions
const fetch = globalThis.fetch || require('node-fetch');

async function clearRateLimits() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    console.log('🔄 Clearing rate limits...');
    
    const response = await fetch(`${baseUrl}/api/rate-limit/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Rate limits cleared successfully!');
      console.log('📝 Message:', result.message);
    } else {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('❌ Failed to clear rate limits:', error.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error clearing rate limits:', error.message);
    console.log('💡 Make sure your Next.js server is running on', baseUrl);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  clearRateLimits();
}

module.exports = { clearRateLimits };
