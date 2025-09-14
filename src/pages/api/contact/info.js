export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try to fetch contact info from WordPress backend first
    const wpResponse = await fetch(`${process.env.WORDPRESS_URL}/wp-json/eternitty/v1/contact-info`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_PASSWORD}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (wpResponse.ok) {
      const wpData = await wpResponse.json();
      return res.status(200).json({
        success: true,
        contactInfo: wpData,
        source: 'wordpress'
      });
    }
  } catch (error) {
    console.log('WordPress backend not accessible, using fallback data');
  }

  // Fallback contact information if WordPress backend is not accessible
  const fallbackContactInfo = {
    address: '123 Business Street, Suite 100',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    phone: '+1 (555) 123-4567',
    email: 'contact@eternitty.com',
    businessHours: [
      'Monday - Friday: 9:00 AM - 6:00 PM',
      'Saturday: 10:00 AM - 4:00 PM',
      'Sunday: Closed'
    ],
    socialMedia: [
      { platform: 'FB', url: 'https://facebook.com/eternitty' },
      { platform: 'TW', url: 'https://twitter.com/eternitty' },
      { platform: 'IG', url: 'https://instagram.com/eternitty' },
      { platform: 'LI', url: 'https://linkedin.com/company/eternitty' }
    ],
    supportEmail: 'support@eternitty.com',
    salesEmail: 'sales@eternitty.com',
    emergencyPhone: '+1 (555) 911-HELP'
  };

  return res.status(200).json({
    success: true,
    contactInfo: fallbackContactInfo,
    source: 'fallback'
  });
}
