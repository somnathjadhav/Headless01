export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'reCAPTCHA token is required' });
  }

  try {
    // Get secret key from reCAPTCHA config endpoint
    let secretKey = null;
    
    try {
      const configResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/recaptcha/config`);
      const configData = await configResponse.json();
      
      if (configData.success && configData.data && configData.data.enabled) {
        secretKey = configData.data.secret_key;
        console.log('✅ Using reCAPTCHA secret key from config endpoint');
      }
    } catch (error) {
      console.log('⚠️ Could not fetch reCAPTCHA config:', error.message);
    }
    
    // Fallback to environment variable
    if (!secretKey) {
      secretKey = process.env.RECAPTCHA_SECRET_KEY;
      if (secretKey) {
        console.log('✅ Using reCAPTCHA secret key from environment variable');
      }
    }
    
    if (!secretKey) {
      console.error('❌ RECAPTCHA_SECRET_KEY not configured');
      return res.status(500).json({ message: 'reCAPTCHA not configured' });
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({ 
        success: true, 
        score: data.score || 0.5,
        action: data.action 
      });
    } else {
      console.error('❌ reCAPTCHA verification failed:', data['error-codes']);
      return res.status(400).json({ 
        success: false, 
        message: 'reCAPTCHA verification failed',
        errors: data['error-codes']
      });
    }
  } catch (error) {
    console.error('❌ reCAPTCHA verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
