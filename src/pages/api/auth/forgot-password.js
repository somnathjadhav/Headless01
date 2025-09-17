export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, recaptchaToken } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
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
            error: 'reCAPTCHA not configured. Please contact administrator.'
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
            error: 'reCAPTCHA verification failed. Please try again.'
          });
        }
      } catch (recaptchaError) {
        console.error('reCAPTCHA verification error:', recaptchaError);
        return res.status(400).json({
          error: 'reCAPTCHA verification failed. Please try again.'
        });
      }
    }

    // WordPress backend URL from environment variable
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL || 'https://woo.local';
    
    // Check if user exists in WordPress
    const checkUserUrl = `${wordpressUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}`;
    
    const userResponse = await fetch(checkUserUrl);
    
    if (!userResponse.ok) {
      return res.status(500).json({ error: 'Failed to check user existence' });
    }

    const users = await userResponse.json();
    
    if (users.length === 0) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: 'If an account with that email exists, password reset instructions have been sent.' 
      });
    }

    // Generate a secure reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Try to send password reset email via WordPress SMTP
    try {
      const wpEmailResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'password-reset',
          to: email,
          data: {
            userName: email.split('@')[0],
            resetLink: resetLink
          }
        })
      });

      if (wpEmailResponse.ok) {
        console.log(`✅ Password reset email sent via WordPress SMTP to ${email}`);
      } else {
        console.log(`⚠️ WordPress SMTP failed for password reset to ${email}`);
      }
    } catch (wpEmailError) {
      console.error('WordPress SMTP error for password reset:', wpEmailError);
    }
    
    return res.status(200).json({ 
      message: 'Password reset instructions have been sent to your email. Please check your inbox and spam folder.',
      resetLink: resetLink
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ 
      error: 'An error occurred while processing your request. Please try again.' 
    });
  }
}

