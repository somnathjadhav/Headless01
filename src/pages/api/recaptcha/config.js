export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL || 'https://woo.local';
    
    // Try to get reCAPTCHA settings from WordPress backend
    let recaptchaConfig = {
      enabled: true, // ENABLED: reCAPTCHA is now enabled
      site_key: null,
      secret_key: null
    };
    
    try {
      // First try the dedicated reCAPTCHA endpoint
      const recaptchaResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/recaptcha`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (recaptchaResponse.ok) {
        const recaptchaData = await recaptchaResponse.json();
        recaptchaConfig = {
          enabled: recaptchaData.enabled || false,
          site_key: recaptchaData.site_key || null,
          secret_key: recaptchaData.secret_key || null
        };
        console.log('✅ Found reCAPTCHA settings from WordPress backend');
      }
    } catch (error) {
      console.log('⚠️ Could not fetch reCAPTCHA settings from WordPress backend:', error.message);
    }

    // If not found in dedicated endpoint, try theme options
    if (!recaptchaConfig.enabled) {
      try {
        const themeResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/theme-options`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (themeResponse.ok) {
          const themeOptions = await themeResponse.json();
          
          if (themeOptions.recaptcha) {
            recaptchaConfig = {
              enabled: themeOptions.recaptcha.enabled || false,
              site_key: themeOptions.recaptcha.site_key || null,
              secret_key: themeOptions.recaptcha.secret_key || null
            };
            console.log('✅ Found reCAPTCHA settings in theme options');
          }
        }
      } catch (error) {
        console.log('⚠️ Could not fetch reCAPTCHA settings from theme options:', error.message);
      }
    }

    // Fallback to environment variables if WordPress backend doesn't have reCAPTCHA settings
    // ENABLED: reCAPTCHA is now enabled
    if (!recaptchaConfig.site_key || !recaptchaConfig.secret_key) {
      const envSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      const envSecretKey = process.env.RECAPTCHA_SECRET_KEY;
      
      if (envSiteKey && envSecretKey) {
        recaptchaConfig = {
          enabled: true, // ENABLED: reCAPTCHA is now enabled
          site_key: envSiteKey,
          secret_key: envSecretKey
        };
        console.log('✅ reCAPTCHA enabled using environment variables');
      }
    }

    return res.status(200).json({
      success: true,
      data: recaptchaConfig
    });

  } catch (error) {
    console.error('Error fetching reCAPTCHA config:', error);
    
    // Fallback to environment variables on error
    const envSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    const envSecretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    const fallbackConfig = {
      enabled: true, // ENABLED: reCAPTCHA is now enabled
      site_key: envSiteKey || null,
      secret_key: envSecretKey || null
    };
    
    console.log('🔍 Fallback config - Site Key:', envSiteKey ? 'Found' : 'Missing');
    console.log('🔍 Fallback config - Secret Key:', envSecretKey ? 'Found' : 'Missing');
    
    return res.status(200).json({
      success: true,
      data: fallbackConfig
    });
  }
}
