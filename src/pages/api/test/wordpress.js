export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const testUserId = req.query.userId || '1';
    
    console.log('Testing WordPress connection...');
    console.log('WordPress URL:', process.env.WORDPRESS_URL);
    console.log('WordPress Username:', process.env.WORDPRESS_USERNAME);
    console.log('WordPress Password:', process.env.WORDPRESS_PASSWORD ? 'Set' : 'Not set');

    // Test WordPress API connection
    const wpResponse = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wp/v2/users/${testUserId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_PASSWORD}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('WordPress API Response Status:', wpResponse.status);
    console.log('WordPress API Response Headers:', Object.fromEntries(wpResponse.headers.entries()));

    if (wpResponse.ok) {
      const userData = await wpResponse.json();
      console.log('WordPress User Data:', JSON.stringify(userData, null, 2));
      
      return res.status(200).json({
        success: true,
        message: 'WordPress backend is accessible',
        userData: userData,
        hasShipping: !!(userData.shipping && (userData.shipping.address_1 || userData.shipping.city)),
        hasBilling: !!(userData.billing && (userData.billing.address_1 || userData.billing.city)),
        shippingData: userData.shipping,
        billingData: userData.billing
      });
    } else {
      const errorText = await wpResponse.text();
      console.log('WordPress API Error Response:', errorText);
      
      return res.status(wpResponse.status).json({
        success: false,
        message: 'WordPress backend returned error',
        status: wpResponse.status,
        statusText: wpResponse.statusText,
        error: errorText
      });
    }
  } catch (error) {
    console.error('WordPress connection test error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to WordPress backend',
      error: error.message,
      stack: error.stack
    });
  }
}
