export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, password, recaptchaToken } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL || process.env.WOOCOMMERCE_URL || 'https://woo.local';
    
    // Create user in WordPress using WooCommerce API (which creates WordPress users)
    try {
      // Use WooCommerce customer creation (creates WordPress users with customer role)
      const customerData = {
        email: email,
        first_name: firstName,
        last_name: lastName,
        username: email,
        password: password,
        meta_data: [
          {
            key: 'email_verified',
            value: 'false'
          }
        ]
      };

      console.log('🔐 Creating customer with data:', { ...customerData, password: '[HIDDEN]' });

      const wcResponse = await fetch(`${wordpressUrl}/wp-json/wc/v3/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(
            `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
          ).toString('base64')}`
        },
        body: JSON.stringify(customerData)
      });

      console.log('🔐 WooCommerce response status:', wcResponse.status);

      if (wcResponse.ok) {
        const customer = await wcResponse.json();
        console.log('🔐 Customer created successfully:', customer.id);
        
        // Generate OTP for email verification
        try {
          const { generateOTPWithExpiration } = await import('../../../lib/email');
          const { otp, expiresAt } = generateOTPWithExpiration();
          
          // Store OTP in user meta
          await fetch(`${wordpressUrl}/wp-json/wc/v3/customers/${customer.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${Buffer.from(
                `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
              ).toString('base64')}`
            },
            body: JSON.stringify({
              meta_data: [
                ...customer.meta_data,
                {
                  key: 'email_verification_otp',
                  value: otp
                },
                {
                  key: 'email_verification_otp_expires',
                  value: expiresAt.toString()
                }
              ]
            })
          });
          
          // Log OTP for development (remove in production)
          console.log(`📧 OTP for ${customer.email}: ${otp}`);
          
          // Try to send email via WordPress SMTP first
          try {
            const wpEmailResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'welcome',
                to: customer.email,
                data: {
                  userName: `${customer.first_name} ${customer.last_name}`,
                  otp: otp
                }
              })
            });

            if (wpEmailResponse.ok) {
              console.log(`✅ Welcome email sent via WordPress SMTP to ${customer.email}`);
            } else {
              console.log(`⚠️ WordPress SMTP failed, OTP available in console: ${otp}`);
            }
          } catch (wpEmailError) {
            console.error('WordPress SMTP error:', wpEmailError);
            console.log(`⚠️ WordPress SMTP failed, OTP available in console: ${otp}`);
          }
        } catch (emailError) {
          console.error('Failed to generate OTP:', emailError);
          // Don't fail the signup if OTP generation fails
        }

        return res.status(201).json({
          success: true,
          message: 'Account created successfully! Please check your email to verify your account before signing in.',
          user: {
            id: customer.id,
            email: customer.email,
            firstName: customer.first_name,
            lastName: customer.last_name,
            username: customer.username,
            emailVerified: false
          }
        });
      } else {
        const errorData = await wcResponse.json();
        console.error('🔐 WooCommerce error:', errorData);
        
        // Handle specific WooCommerce errors
        if (wcResponse.status === 400) {
          if (errorData.code === 'woocommerce_rest_customer_email_exists') {
            return res.status(400).json({
              success: false,
              message: 'An account with this email already exists'
            });
          } else if (errorData.message && errorData.message.includes('already exists')) {
            return res.status(400).json({
              success: false,
              message: 'An account with this email already exists'
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: errorData.message || 'Failed to create account'
        });
      }
    } catch (wcError) {
      console.error('🔐 WooCommerce API error:', wcError);
      
      return res.status(500).json({
        success: false,
        message: 'Unable to create account. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
}
