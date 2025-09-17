export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.body.userId || '1';
    
    console.log('Adding sample address for user:', userId);

    // Add sample shipping address to WordPress user
    const wpResponse = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_PASSWORD}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shipping: {
          first_name: 'Somnath',
          last_name: 'Jadhav',
          company: 'Eternity Web Solutions Private Limited',
          address_1: 'B-1104, Mantra Senses, Nyati Estate Road',
          address_2: 'Handewadi',
          city: 'Pune',
          state: 'Maharashtra',
          postcode: '412308',
          country: 'IN',
          phone: '09270153230'
        },
        billing: {
          first_name: 'Somnath',
          last_name: 'Jadhav',
          company: 'Eternity Web Solutions Private Limited',
          address_1: 'B-1104, Mantra Senses, Nyati Estate Road',
          address_2: 'Handewadi',
          city: 'Pune',
          state: 'Maharashtra',
          postcode: '412308',
          country: 'IN',
          phone: '09270153230',
          email: 'somnathhjadhav@gmail.com'
        }
      })
    });

    console.log('WordPress Update Response Status:', wpResponse.status);

    if (wpResponse.ok) {
      const updatedUserData = await wpResponse.json();
      console.log('Updated WordPress User Data:', JSON.stringify(updatedUserData, null, 2));
      
      return res.status(200).json({
        success: true,
        message: 'Sample addresses added successfully',
        userData: updatedUserData,
        hasShipping: !!(updatedUserData.shipping && (updatedUserData.shipping.address_1 || updatedUserData.shipping.city)),
        hasBilling: !!(updatedUserData.billing && (updatedUserData.billing.address_1 || updatedUserData.billing.city)),
        shippingData: updatedUserData.shipping,
        billingData: updatedUserData.billing
      });
    } else {
      const errorText = await wpResponse.text();
      console.log('WordPress Update Error Response:', errorText);
      
      return res.status(wpResponse.status).json({
        success: false,
        message: 'Failed to add sample addresses',
        status: wpResponse.status,
        statusText: wpResponse.statusText,
        error: errorText
      });
    }
  } catch (error) {
    console.error('Add sample address error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to add sample addresses',
      error: error.message,
      stack: error.stack
    });
  }
}
