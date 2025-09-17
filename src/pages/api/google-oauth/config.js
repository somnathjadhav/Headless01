export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL || 'https://woo.local';
    
    // Try to get Google OAuth settings from WordPress backend
    let oauthConfig = {
      enabled: false,
      client_id: null,
      client_secret: null,
      redirect_uri: null,
      scope: 'email profile'
    };
    
    // Try the existing Google OAuth login endpoint
    console.log('🔍 Checking Google OAuth login endpoint...');
    try {
      const oauthResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/auth/google/login`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📡 OAuth response status:', oauthResponse.status);
      
      if (oauthResponse.ok) {
        const oauthData = await oauthResponse.json();
        console.log('📄 OAuth data received:', JSON.stringify(oauthData, null, 2));
        
        // If we get an auth_url, it means Google OAuth is working
        if (oauthData.auth_url) {
          // Extract client_id from the auth_url
          const urlParams = new URLSearchParams(oauthData.auth_url.split('?')[1]);
          const clientId = urlParams.get('client_id');
          const redirectUri = urlParams.get('redirect_uri');
          const scope = urlParams.get('scope');
          
          console.log('🔑 Extracted from auth_url - clientId:', clientId, 'redirectUri:', redirectUri, 'scope:', scope);
          
          if (clientId) {
              oauthConfig = {
                enabled: true,
                client_id: clientId,
                client_secret: 'configured', // We know it's configured since the endpoint works
                redirect_uri: redirectUri || `${wordpressUrl}/wp-json/eternitty/v1/auth/google/callback`,
                scope: scope || 'email profile' // Use the scope from WordPress or fallback
              };
            console.log('✅ Found Google OAuth settings from existing login endpoint (auth_url detected)');
          }
        } else {
          oauthConfig = {
            enabled: oauthData.enabled || false,
            client_id: oauthData.client_id || null,
            client_secret: oauthData.client_secret || null,
            redirect_uri: oauthData.redirect_uri || null,
            scope: oauthData.scope || 'openid email profile'
          };
          console.log('✅ Found Google OAuth settings from existing login endpoint');
        }
      } else {
        console.log('❌ OAuth endpoint returned error:', oauthResponse.status, oauthResponse.statusText);
      }
    } catch (error) {
      console.log('⚠️ Could not fetch Google OAuth settings from login endpoint:', error.message);
    }

    // If not found in dedicated endpoint, try theme-options with Google OAuth data
    if (!oauthConfig.enabled) {
      try {
        const themeResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/theme-options`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (themeResponse.ok) {
          const themeOptions = await themeResponse.json();
          
          // Check various possible option names for Google OAuth
          const possibleGoogleOptions = [
            'google_oauth',
            'googleOauth', 
            'google_login',
            'googleLogin',
            'social_login',
            'socialLogin'
          ];

          for (const optionName of possibleGoogleOptions) {
            if (themeOptions[optionName]) {
              const googleOpts = themeOptions[optionName];
              if (googleOpts.client_id || googleOpts.clientId) {
                oauthConfig = {
                  enabled: googleOpts.enabled !== false, // Default to enabled if client_id exists
                  client_id: googleOpts.client_id || googleOpts.clientId || null,
                  client_secret: googleOpts.client_secret || googleOpts.clientSecret || null,
                  redirect_uri: googleOpts.redirect_uri || googleOpts.redirectUri || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`,
                  scope: googleOpts.scope || 'openid email profile'
                };
                console.log(`✅ Found Google OAuth settings in theme options under '${optionName}'`);
                break;
              }
            }
          }

          // Also check for individual Google OAuth options at root level
          if (!oauthConfig.enabled) {
            const possibleClientIdKeys = [
              'google_oauth_client_id',
              'google_client_id', 
              'googleOauthClientId',
              'googleClientId',
              'eternitty_google_oauth_client_id',
              'headless_google_oauth_client_id'
            ];

            const possibleClientSecretKeys = [
              'google_oauth_client_secret',
              'google_client_secret',
              'googleOauthClientSecret', 
              'googleClientSecret',
              'eternitty_google_oauth_client_secret',
              'headless_google_oauth_client_secret'
            ];

            let foundClientId = null;
            let foundClientSecret = null;

            for (const key of possibleClientIdKeys) {
              if (themeOptions[key]) {
                foundClientId = themeOptions[key];
                break;
              }
            }

            for (const key of possibleClientSecretKeys) {
              if (themeOptions[key]) {
                foundClientSecret = themeOptions[key];
                break;
              }
            }

            if (foundClientId && foundClientSecret) {
              oauthConfig = {
                enabled: true,
                client_id: foundClientId,
                client_secret: foundClientSecret,
                redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`,
                scope: 'email profile'
              };
              console.log('✅ Found Google OAuth credentials in theme options at root level');
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Could not fetch Google OAuth settings from theme options:', error.message);
      }
    }

    // Fallback to environment variables if WordPress backend doesn't have Google OAuth settings
    if (!oauthConfig.enabled) {
      const envClientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
      const envClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
      const envRedirectUri = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI;
      
      if (envClientId && envClientSecret && envRedirectUri) {
        oauthConfig = {
          enabled: true,
          client_id: envClientId,
          client_secret: envClientSecret,
          redirect_uri: envRedirectUri,
          scope: 'email profile'
        };
        console.log('✅ Using Google OAuth settings from environment variables (fallback)');
      }
    }

    return res.status(200).json({
      success: true,
      data: oauthConfig
    });

  } catch (error) {
    console.error('Error fetching Google OAuth config:', error);
    
    // Fallback to environment variables on error
    const envClientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
    const envClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const envRedirectUri = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI;
    
    const fallbackConfig = {
      enabled: !!(envClientId && envClientSecret && envRedirectUri),
      client_id: envClientId || null,
      client_secret: envClientSecret || null,
      redirect_uri: envRedirectUri || null,
      scope: 'email profile'
    };
    
    return res.status(200).json({
      success: true,
      data: fallbackConfig
    });
  }
}
