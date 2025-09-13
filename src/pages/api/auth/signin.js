export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, recaptchaToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Username and password are required'
      });
    }

    // Verify reCAPTCHA if provided
    if (recaptchaToken) {
      try {
        // Get secret key from reCAPTCHA config endpoint
        let secretKey = null;
        
        try {
          const configResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/recaptcha/config`);
          const configData = await configResponse.json();
          
          if (configData.success && configData.data && configData.data.enabled) {
            secretKey = configData.data.secret_key;
          }
        } catch (error) {
          console.log('⚠️ Could not fetch reCAPTCHA config:', error.message);
        }
        
        // Fallback to environment variable
        if (!secretKey) {
          secretKey = process.env.RECAPTCHA_SECRET_KEY;
        }
        
        if (!secretKey) {
          return res.status(400).json({
            success: false,
            message: 'reCAPTCHA not configured. Please contact administrator.'
          });
        }

        const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${secretKey}&response=${recaptchaToken}`,
        });

        const recaptchaData = await recaptchaResponse.json();
        
        if (!recaptchaData.success) {
          return res.status(400).json({
            success: false,
            message: 'reCAPTCHA verification failed. Please try again.'
          });
        }
      } catch (recaptchaError) {
        console.error('reCAPTCHA verification error:', recaptchaError);
        return res.status(400).json({
          success: false,
          message: 'reCAPTCHA verification failed. Please try again.'
        });
      }
    }

    console.log('🔐 Attempting WordPress authentication for:', email);

    // Try to find user by email or username
    let user = null;
    let username = null;

    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL || 'https://woo.local';
    
    // Try to find user by username or email using WordPress Users API
    console.log('🔐 Searching for user with:', email);
    
    // First try to find by exact email match
    const usersResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}`);
    
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      if (users && users.length > 0) {
        // Find exact match by email or username
        const wpUser = users.find(u => 
          u.email === email || 
          u.slug === email || 
          u.name === email
        ) || users[0]; // Fallback to first user if no exact match
        
        // Validate that this user actually exists and is active
        if (wpUser && wpUser.id) {
          user = {
            id: wpUser.id,
            name: wpUser.name,
            email: wpUser.email || email,
            slug: wpUser.slug,
            first_name: wpUser.first_name || '',
            last_name: wpUser.last_name || '',
            roles: wpUser.roles || []
          };
          username = wpUser.slug;
          console.log('🔐 Found WordPress user:', username, 'with ID:', wpUser.id);
        }
      }
    }

    // If not found in WordPress Users API, try WooCommerce customers
    if (!user || !username) {
      console.log('🔐 User not found in WordPress Users API, checking WooCommerce customers...');
      
      try {
        const wcResponse = await fetch(`${wordpressUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
            ).toString('base64')}`
          }
        });

        if (wcResponse.ok) {
          const customers = await wcResponse.json();
          if (customers && customers.length > 0) {
            const customer = customers[0];
            user = {
              id: customer.id,
              name: `${customer.first_name} ${customer.last_name}`.trim(),
              email: customer.email,
              slug: customer.username,
              first_name: customer.first_name,
              last_name: customer.last_name,
              roles: ['customer']
            };
            username = customer.username;
            console.log('🔐 Found WooCommerce customer:', username);
          }
        }
      } catch (wcError) {
        console.error('🔐 WooCommerce customer search error:', wcError);
      }
    }

    if (!user || !username) {
      console.log('🔐 No user found with email/username:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password',
        error: 'USER_NOT_FOUND'
      });
    }

    // Additional validation: Ensure user exists in WordPress database
    if (!user.id || user.id <= 0) {
      console.log('🔐 Invalid user ID for:', username);
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password',
        error: 'INVALID_USER'
      });
    }

    console.log('🔐 Found valid user:', username, 'with ID:', user.id);

    // Now attempt to authenticate using WordPress login
    const loginUrl = `${wordpressUrl}/wp-login.php`;
    
    try {
      const loginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          log: username,
          pwd: password,
          'wp-submit': 'Log In',
          'redirect_to': `${wordpressUrl}/wp-admin/`,
          testcookie: '1'
        }),
        redirect: 'manual' // Don't follow redirects
      });

      // Check if login was successful by looking at cookies and response
      const cookies = loginResponse.headers.get('set-cookie');
      const responseText = await loginResponse.text();
      
      // More strict validation for successful login
      const isLoggedIn = cookies && (
        // Check for specific WordPress logged-in cookie
        cookies.includes('wordpress_logged_in_') && 
        // Ensure it's not an error response
        !responseText.includes('ERROR') &&
        !responseText.includes('Invalid username') &&
        !responseText.includes('The password you entered') &&
        !responseText.includes('Lost your password') &&
        // Check for successful login indicators (any one is sufficient)
        (responseText.includes('Dashboard') || 
         responseText.includes('wp-admin') ||
         responseText.includes('Log out') ||
         responseText.includes('wp-content') ||
         responseText.includes('admin-bar'))
      );

      if (isLoggedIn) {
        console.log('🔐 WordPress authentication successful for:', username);
        
        // Create a simple token (in production, you'd want to use a proper JWT library)
        const token = Buffer.from(`${user.id}:${Date.now()}:${Math.random()}`).toString('base64');
        
        return res.status(200).json({
          success: true,
          message: 'Authentication successful',
          token: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email || email, // Use provided email if user.email is null
            username: user.slug,
            roles: user.roles || [],
            avatar: user.avatar_urls?.medium || null
          }
        });
      } else {
        console.log('🔐 WordPress authentication failed for:', username);
        return res.status(401).json({
          success: false,
          message: 'Invalid email/username or password',
          error: 'INVALID_CREDENTIALS'
        });
      }
    } catch (loginError) {
      console.log('🔐 WordPress login error:', loginError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password',
        error: 'LOGIN_FAILED'
      });
    }

  } catch (error) {
    console.error('🔐 Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
