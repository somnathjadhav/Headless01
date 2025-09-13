export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL || 'https://woo.local';
    
    // Check if we're in local development
    const isLocalDevelopment = process.env.NODE_ENV === 'development' || 
                              process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost') ||
                              process.env.NEXT_PUBLIC_SITE_URL?.includes('127.0.0.1') ||
                              !process.env.NEXT_PUBLIC_SITE_URL;

    // Try to get reCAPTCHA settings from WordPress backend
    let recaptchaConfig = {
      enabled: !isLocalDevelopment, // Disable reCAPTCHA for local development
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
        console.log('🔍 WordPress source - Site Key:', recaptchaData.site_key ? 'Found' : 'Missing');
        console.log('🔍 WordPress source - Secret Key:', recaptchaData.secret_key ? 'Found' : 'Missing');
      } else {
        console.log('⚠️ WordPress reCAPTCHA endpoint not accessible:', recaptchaResponse.status);
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
    // Only enable if not in local development
    if (!recaptchaConfig.site_key || !recaptchaConfig.secret_key) {
      const envSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      const envSecretKey = process.env.RECAPTCHA_SECRET_KEY;
      
      if (envSiteKey && envSecretKey && !isLocalDevelopment) {
        recaptchaConfig = {
          enabled: true, // Enable reCAPTCHA only for non-local environments
          site_key: envSiteKey,
          secret_key: envSecretKey
        };
        console.log('✅ reCAPTCHA enabled using environment variables');
        console.log('🔍 Environment source - Site Key:', envSiteKey ? 'Found' : 'Missing');
        console.log('🔍 Environment source - Secret Key:', envSecretKey ? 'Found' : 'Missing');
      } else if (isLocalDevelopment) {
        console.log('🚫 reCAPTCHA disabled for local development');
      }
    }

    // Add source information
    const responseData = {
      ...recaptchaConfig,
      source: recaptchaConfig.site_key && recaptchaConfig.secret_key ? 
        (recaptchaConfig.site_key === process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? 'environment' : 'wordpress') : 
        'none'
    };

    return res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching reCAPTCHA config:', error);
    
    // Fallback to environment variables on error
    const envSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    const envSecretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    const fallbackConfig = {
      enabled: !isLocalDevelopment, // Disable reCAPTCHA for local development
      site_key: envSiteKey || null,
      secret_key: envSecretKey || null
    };
    
    console.log('🔍 Fallback config - Site Key:', envSiteKey ? 'Found' : 'Missing');
    console.log('🔍 Fallback config - Secret Key:', envSecretKey ? 'Found' : 'Missing');
    
    const fallbackResponseData = {
      ...fallbackConfig,
      source: fallbackConfig.site_key && fallbackConfig.secret_key ? 'environment' : 'none'
    };

    return res.status(200).json({
      success: true,
      data: fallbackResponseData
    });
  }
}
