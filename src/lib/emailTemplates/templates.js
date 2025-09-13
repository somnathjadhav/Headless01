// Email Templates - Modular and Scalable
// Add new templates here for future email types

export const emailTemplates = {
  // Email Verification Template
  email_verification: (data) => {
    const { userName, verificationLink, verificationCode, expiresIn = '24 hours' } = data;
    
    return {
      subject: 'Verify Your Email Address - NextGen Ecommerce',
      requiredFields: ['userName', 'verificationLink'],
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">Verify Your Email Address</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hello ${userName},</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
            Thank you for signing up! Please verify your email address to complete your registration and start shopping.
          </p>
          
          <div style="margin: 25px 0;">
            <a href="${verificationLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: #ffffff; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      font-weight: 600; 
                      font-size: 16px; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              Verify Email Address
            </a>
          </div>
          
          <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
            This link will expire in ${expiresIn}.
          </p>
        </div>
        
        ${verificationCode ? `
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #1976d2; font-weight: 600;">Alternative Verification Method</p>
          <p style="margin: 0 0 15px 0; color: #333;">If the button doesn't work, you can also verify using this code:</p>
          <div style="background-color: #1976d2; color: white; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 4px; display: inline-block;">
            ${verificationCode}
          </div>
        </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
            <strong>What happens next?</strong>
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px;">
            <li>Click the verification link above</li>
            <li>Your account will be activated</li>
            <li>You can start shopping immediately</li>
            <li>Access exclusive deals and offers</li>
          </ul>
        </div>
        
        <div style="margin-top: 25px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Security Note:</strong> If you didn't create an account with us, please ignore this email. 
            Your email address will not be used without verification.
          </p>
        </div>
      `,
      text: `Verify Your Email Address - NextGen Ecommerce

Hello ${userName},

Thank you for signing up! Please verify your email address to complete your registration.

Verification Link: ${verificationLink}

This link will expire in ${expiresIn}.

${verificationCode ? `Alternative Code: ${verificationCode}` : ''}

What happens next?
- Click the verification link above
- Your account will be activated
- You can start shopping immediately
- Access exclusive deals and offers

Security Note: If you didn't create an account with us, please ignore this email.

Best regards,
NextGen Ecommerce Team`
    };
  },

  // Welcome Template (after verification)
  welcome: (data) => {
    const { userName, loginLink, accountLink } = data;
    
    return {
      subject: 'Welcome to NextGen Ecommerce!',
      requiredFields: ['userName'],
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #28a745; margin: 0 0 10px 0; font-size: 24px;">🎉 Welcome to NextGen Ecommerce!</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hello ${userName},</p>
        </div>
        
        <div style="background-color: #d4edda; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #155724; font-size: 16px; font-weight: 600;">
            Your email has been successfully verified! Your account is now active.
          </p>
        </div>
        
        <div style="margin: 25px 0;">
          <a href="${loginLink || '#'}" 
             style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                    color: #ffffff; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    font-weight: 600; 
                    font-size: 16px; 
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">
            Start Shopping Now
          </a>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">What you can do now:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #666;">
            <li>Browse our latest products and collections</li>
            <li>Create wishlists and save your favorites</li>
            <li>Track your orders in real-time</li>
            <li>Manage your account settings</li>
            <li>Get exclusive member-only deals</li>
          </ul>
        </div>
        
        ${accountLink ? `
        <div style="text-align: center; margin: 25px 0;">
          <a href="${accountLink}" 
             style="color: #667eea; text-decoration: none; font-size: 14px;">
            Manage Your Account →
          </a>
        </div>
        ` : ''}
      `,
      text: `Welcome to NextGen Ecommerce!

Hello ${userName},

Your email has been successfully verified! Your account is now active.

What you can do now:
- Browse our latest products and collections
- Create wishlists and save your favorites
- Track your orders in real-time
- Manage your account settings
- Get exclusive member-only deals

Start Shopping: ${loginLink || '#'}

Best regards,
NextGen Ecommerce Team`
    };
  },

  // Password Reset Template
  password_reset: (data) => {
    const { userName, resetLink, expiresIn = '1 hour' } = data;
    
    return {
      subject: 'Reset Your Password - NextGen Ecommerce',
      requiredFields: ['userName', 'resetLink'],
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #dc3545; margin: 0 0 10px 0; font-size: 24px;">Reset Your Password</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hello ${userName},</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="margin: 25px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%); 
                      color: #ffffff; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      font-weight: 600; 
                      font-size: 16px; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);">
              Reset Password
            </a>
          </div>
          
          <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
            This link will expire in ${expiresIn}.
          </p>
        </div>
        
        <div style="margin-top: 25px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. 
            Your password will remain unchanged.
          </p>
        </div>
      `,
      text: `Reset Your Password - NextGen Ecommerce

Hello ${userName},

We received a request to reset your password. Click the link below to create a new password.

Reset Link: ${resetLink}

This link will expire in ${expiresIn}.

Security Note: If you didn't request this password reset, please ignore this email.

Best regards,
NextGen Ecommerce Team`
    };
  },

  // Order Confirmation Template (for future use)
  order_confirmation: (data) => {
    const { userName, orderNumber, orderDetails, totalAmount } = data;
    
    return {
      subject: `Order Confirmation #${orderNumber} - NextGen Ecommerce`,
      requiredFields: ['userName', 'orderNumber'],
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #28a745; margin: 0 0 10px 0; font-size: 24px;">✅ Order Confirmed!</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hello ${userName},</p>
        </div>
        
        <div style="background-color: #d4edda; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #155724; font-size: 16px; font-weight: 600;">
            Thank you for your order! Order #${orderNumber} has been confirmed.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Order Details:</h3>
          ${orderDetails || '<p>Order details will be available soon.</p>'}
          ${totalAmount ? `<p style="margin: 15px 0 0 0; font-weight: 600; color: #333;">Total: ${totalAmount}</p>` : ''}
        </div>
        
        <p style="color: #666; font-size: 14px;">
          We'll send you another email when your order ships. You can track your order status anytime in your account.
        </p>
      `,
      text: `Order Confirmation #${orderNumber} - NextGen Ecommerce

Hello ${userName},

Thank you for your order! Order #${orderNumber} has been confirmed.

Order Details:
${orderDetails || 'Order details will be available soon.'}
${totalAmount ? `Total: ${totalAmount}` : ''}

We'll send you another email when your order ships.

Best regards,
NextGen Ecommerce Team`
    };
  }
};
