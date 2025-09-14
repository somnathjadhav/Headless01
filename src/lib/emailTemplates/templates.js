// Email Templates - Modular and Scalable
// Add new templates here for future email types

export const emailTemplates = {
  // Email Verification Template
  email_verification: (data) => {
    const { userName, verificationLink, verificationCode, expiresIn = '24 hours', siteName, primaryColor, secondaryColor } = data;
    
    return {
      subject: `Verify Your Email Address - ${siteName}`,
      requiredFields: ['userName', 'verificationLink'],
      content: `
        <!-- Header Section -->
        <div style="text-align: center; margin-bottom: 40px; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
          <div style="font-size: 64px; margin-bottom: 20px;">✉️</div>
          <h2 style="color: #ffffff; margin: 0 0 15px 0; font-size: 32px; font-weight: 600;">Verify Your Email Address</h2>
          <p style="color: #f0f0f0; margin: 0; font-size: 18px; opacity: 0.9;">Hello ${userName},</p>
        </div>
        
        <!-- Main Content -->
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center; border: 2px solid #e0e0e0;">
          <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
          <p style="margin: 0 0 25px 0; color: #2c3e50; font-size: 18px; font-weight: 500; line-height: 1.6;">
            Thank you for signing up! Please verify your email address to complete your registration and start shopping.
          </p>
          
          <div style="margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: #ffffff; 
                      padding: 18px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: 600; 
                      font-size: 18px; 
                      display: inline-block;
                      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                      transition: all 0.3s ease;">
              ✅ Verify Email Address
            </a>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.8); padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #e74c3c; font-size: 14px; font-weight: 600;">
              ⏰ This link will expire in ${expiresIn}
            </p>
          </div>
        </div>
        
        ${verificationCode ? `
        <!-- Alternative Verification Method -->
        <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center; border: 2px solid #ffb347;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <div style="font-size: 32px; margin-right: 15px;">🔐</div>
            <h3 style="margin: 0; color: #8b4513; font-size: 22px; font-weight: 600;">Alternative Verification Method</h3>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.9); padding: 25px; border-radius: 8px;">
            <p style="margin: 0 0 20px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">
              If the button doesn't work, you can also verify using this code:
            </p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; font-size: 28px; font-weight: bold; letter-spacing: 4px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              ${verificationCode}
            </div>
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
      text: `Verify Your Email Address - ${siteName}

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
${siteName} Team`
    };
  },

  // Welcome Template (after verification)
  welcome: (data) => {
    const { userName, loginLink, accountLink, siteName, siteUrl, successColor } = data;
    
    return {
      subject: `Welcome to ${siteName}!`,
      requiredFields: ['userName'],
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: ${successColor}; margin: 0 0 10px 0; font-size: 24px;">🎉 Welcome to ${siteName}!</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hello ${userName},</p>
        </div>
        
        <div class="alert-success" style="background-color: #d4edda; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #155724; font-size: 16px; font-weight: 600;">
            Your email has been successfully verified! Your account is now active.
          </p>
        </div>
        
        <div style="margin: 25px 0;">
          <a href="${loginLink || siteUrl || '#'}" 
             class="btn-success"
             style="background: linear-gradient(135deg, ${successColor} 0%, #20c997 100%); 
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
      text: `Welcome to ${siteName}!

Hello ${userName},

Your email has been successfully verified! Your account is now active.

What you can do now:
- Browse our latest products and collections
- Create wishlists and save your favorites
- Track your orders in real-time
- Manage your account settings
- Get exclusive member-only deals

Start Shopping: ${loginLink || siteUrl || '#'}

Best regards,
${siteName} Team`
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

  // Order Confirmation Template
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
  },

  // Password Reset Success Template
  password_reset_success: (data) => {
    const { userName, loginLink } = data;
    
    return {
      subject: 'Password Reset Successful - NextGen Ecommerce',
      requiredFields: ['userName'],
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #28a745; margin: 0 0 10px 0; font-size: 24px;">✅ Password Reset Successful!</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hello ${userName},</p>
        </div>
        
        <div style="background-color: #d4edda; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #155724; font-size: 16px; font-weight: 600;">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
        </div>
        
        <div style="margin: 25px 0; text-align: center;">
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
            Login to Your Account
          </a>
        </div>
        
        <div style="margin-top: 25px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Security Note:</strong> If you didn't reset your password, please contact our support team immediately.
          </p>
        </div>
      `,
      text: `Password Reset Successful - NextGen Ecommerce

Hello ${userName},

Your password has been successfully reset. You can now log in with your new password.

Login: ${loginLink || '#'}

Security Note: If you didn't reset your password, please contact our support team immediately.

Best regards,
NextGen Ecommerce Team`
    };
  },

  // Order Shipped Template
  order_shipped: (data) => {
    const { userName, orderNumber, trackingNumber, estimatedDelivery } = data;
    
    return {
      subject: `Your Order #${orderNumber} Has Shipped! - NextGen Ecommerce`,
      requiredFields: ['userName', 'orderNumber'],
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #17a2b8; margin: 0 0 10px 0; font-size: 24px;">🚚 Your Order Has Shipped!</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hello ${userName},</p>
        </div>
        
        <div style="background-color: #d1ecf1; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #0c5460; font-size: 16px; font-weight: 600;">
            Great news! Your order #${orderNumber} is on its way to you.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Shipping Details:</h3>
          <p style="margin: 0 0 10px 0; color: #666;"><strong>Order Number:</strong> ${orderNumber}</p>
          ${trackingNumber ? `<p style="margin: 0 0 10px 0; color: #666;"><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
          ${estimatedDelivery ? `<p style="margin: 0; color: #666;"><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>` : ''}
        </div>
        
        <p style="color: #666; font-size: 14px;">
          You can track your package using the tracking number above. We'll send you another email when your order is delivered.
        </p>
      `,
      text: `Your Order #${orderNumber} Has Shipped! - NextGen Ecommerce

Hello ${userName},

Great news! Your order #${orderNumber} is on its way to you.

Shipping Details:
Order Number: ${orderNumber}
${trackingNumber ? `Tracking Number: ${trackingNumber}` : ''}
${estimatedDelivery ? `Estimated Delivery: ${estimatedDelivery}` : ''}

You can track your package using the tracking number above.

Best regards,
NextGen Ecommerce Team`
    };
  },

  // Order Delivered Template
  order_delivered: (data) => {
    const { userName, orderNumber, deliveryDate } = data;
    
    return {
      subject: `Your Order #${orderNumber} Has Been Delivered! - NextGen Ecommerce`,
      requiredFields: ['userName', 'orderNumber'],
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #28a745; margin: 0 0 10px 0; font-size: 24px;">📦 Order Delivered!</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hello ${userName},</p>
        </div>
        
        <div style="background-color: #d4edda; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #155724; font-size: 16px; font-weight: 600;">
            🎉 Your order #${orderNumber} has been successfully delivered!
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Delivery Details:</h3>
          <p style="margin: 0 0 10px 0; color: #666;"><strong>Order Number:</strong> ${orderNumber}</p>
          ${deliveryDate ? `<p style="margin: 0; color: #666;"><strong>Delivered On:</strong> ${deliveryDate}</p>` : ''}
        </div>
        
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1976d2;">What's Next?</h3>
          <ul style="margin: 0; padding-left: 20px; color: #666;">
            <li>Check your order and ensure everything is as expected</li>
            <li>Leave a review for the products you received</li>
            <li>Keep your receipt for warranty purposes</li>
            <li>Contact us if you have any issues with your order</li>
          </ul>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Thank you for shopping with us! We hope you love your new items.
        </p>
      `,
      text: `Your Order #${orderNumber} Has Been Delivered! - NextGen Ecommerce

Hello ${userName},

🎉 Your order #${orderNumber} has been successfully delivered!

Delivery Details:
Order Number: ${orderNumber}
${deliveryDate ? `Delivered On: ${deliveryDate}` : ''}

What's Next?
- Check your order and ensure everything is as expected
- Leave a review for the products you received
- Keep your receipt for warranty purposes
- Contact us if you have any issues with your order

Thank you for shopping with us!

Best regards,
NextGen Ecommerce Team`
    };
  },

  // Order Cancelled Template
  order_cancelled: (data) => {
    const { userName, orderNumber, reason, refundInfo } = data;
    
    return {
      subject: `Order #${orderNumber} Cancelled - NextGen Ecommerce`,
      requiredFields: ['userName', 'orderNumber'],
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #dc3545; margin: 0 0 10px 0; font-size: 24px;">❌ Order Cancelled</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hello ${userName},</p>
        </div>
        
        <div style="background-color: #f8d7da; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #721c24; font-size: 16px; font-weight: 600;">
            We're sorry to inform you that your order #${orderNumber} has been cancelled.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Cancellation Details:</h3>
          <p style="margin: 0 0 10px 0; color: #666;"><strong>Order Number:</strong> ${orderNumber}</p>
          ${reason ? `<p style="margin: 0; color: #666;"><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        
        ${refundInfo ? `
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #155724;">Refund Information:</h3>
          <p style="margin: 0; color: #155724;">${refundInfo}</p>
        </div>
        ` : ''}
        
        <p style="color: #666; font-size: 14px;">
          If you have any questions about this cancellation, please don't hesitate to contact our customer support team.
        </p>
      `,
      text: `Order #${orderNumber} Cancelled - NextGen Ecommerce

Hello ${userName},

We're sorry to inform you that your order #${orderNumber} has been cancelled.

Cancellation Details:
Order Number: ${orderNumber}
${reason ? `Reason: ${reason}` : ''}

${refundInfo ? `Refund Information: ${refundInfo}` : ''}

If you have any questions about this cancellation, please contact our customer support team.

Best regards,
NextGen Ecommerce Team`
    };
  },

  // Payment Success Template
  payment_success: (data) => {
    const { userName, orderNumber, amount, paymentMethod } = data;
    
    return {
      subject: `Payment Successful - Order #${orderNumber} - NextGen Ecommerce`,
      requiredFields: ['userName', 'orderNumber', 'amount'],
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #28a745; margin: 0 0 10px 0; font-size: 24px;">💳 Payment Successful!</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hello ${userName},</p>
        </div>
        
        <div style="background-color: #d4edda; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #155724; font-size: 16px; font-weight: 600;">
            Your payment has been processed successfully!
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Payment Details:</h3>
          <p style="margin: 0 0 10px 0; color: #666;"><strong>Order Number:</strong> ${orderNumber}</p>
          <p style="margin: 0 0 10px 0; color: #666;"><strong>Amount:</strong> ${amount}</p>
          ${paymentMethod ? `<p style="margin: 0; color: #666;"><strong>Payment Method:</strong> ${paymentMethod}</p>` : ''}
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Your order is now being processed and you'll receive a confirmation email shortly.
        </p>
      `,
      text: `Payment Successful - Order #${orderNumber} - NextGen Ecommerce

Hello ${userName},

Your payment has been processed successfully!

Payment Details:
Order Number: ${orderNumber}
Amount: ${amount}
${paymentMethod ? `Payment Method: ${paymentMethod}` : ''}

Your order is now being processed.

Best regards,
NextGen Ecommerce Team`
    };
  },

  // Payment Failed Template
  payment_failed: (data) => {
    const { userName, orderNumber, amount, reason } = data;
    
    return {
      subject: `Payment Failed - Order #${orderNumber} - NextGen Ecommerce`,
      requiredFields: ['userName', 'orderNumber'],
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #dc3545; margin: 0 0 10px 0; font-size: 24px;">❌ Payment Failed</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hello ${userName},</p>
        </div>
        
        <div style="background-color: #f8d7da; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #721c24; font-size: 16px; font-weight: 600;">
            We're sorry, but your payment for order #${orderNumber} could not be processed.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Payment Details:</h3>
          <p style="margin: 0 0 10px 0; color: #666;"><strong>Order Number:</strong> ${orderNumber}</p>
          ${amount ? `<p style="margin: 0 0 10px 0; color: #666;"><strong>Amount:</strong> ${amount}</p>` : ''}
          ${reason ? `<p style="margin: 0; color: #666;"><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="#" 
             style="background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%); 
                    color: #ffffff; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    font-weight: 600; 
                    font-size: 16px; 
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);">
            Try Payment Again
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Please try again with a different payment method or contact your bank if the issue persists.
        </p>
      `,
      text: `Payment Failed - Order #${orderNumber} - NextGen Ecommerce

Hello ${userName},

We're sorry, but your payment for order #${orderNumber} could not be processed.

Payment Details:
Order Number: ${orderNumber}
${amount ? `Amount: ${amount}` : ''}
${reason ? `Reason: ${reason}` : ''}

Please try again with a different payment method or contact your bank if the issue persists.

Best regards,
NextGen Ecommerce Team`
    };
  },

  // Account Locked Template
  account_locked: (data) => {
    const { userName, reason, unlockLink } = data;
    
    return {
      subject: 'Account Security Alert - NextGen Ecommerce',
      requiredFields: ['userName'],
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #dc3545; margin: 0 0 10px 0; font-size: 24px;">🔒 Account Locked</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hello ${userName},</p>
        </div>
        
        <div style="background-color: #f8d7da; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #721c24; font-size: 16px; font-weight: 600;">
            Your account has been temporarily locked for security reasons.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Security Details:</h3>
          ${reason ? `<p style="margin: 0; color: #666;"><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        
        ${unlockLink ? `
        <div style="margin: 25px 0; text-align: center;">
          <a href="${unlockLink}" 
             style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); 
                    color: #ffffff; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    font-weight: 600; 
                    font-size: 16px; 
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);">
            Unlock Account
          </a>
        </div>
        ` : ''}
        
        <div style="margin-top: 25px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Security Note:</strong> If you believe this is an error, please contact our support team immediately.
          </p>
        </div>
      `,
      text: `Account Security Alert - NextGen Ecommerce

Hello ${userName},

Your account has been temporarily locked for security reasons.

Security Details:
${reason ? `Reason: ${reason}` : ''}

${unlockLink ? `Unlock Account: ${unlockLink}` : ''}

Security Note: If you believe this is an error, please contact our support team immediately.

Best regards,
NextGen Ecommerce Team`
    };
  },

  // Security Alert Template
  security_alert: (data) => {
    const { userName, alertType, details, actionRequired } = data;
    
    return {
      subject: 'Security Alert - NextGen Ecommerce',
      requiredFields: ['userName', 'alertType'],
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #dc3545; margin: 0 0 10px 0; font-size: 24px;">⚠️ Security Alert</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hello ${userName},</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #856404; font-size: 16px; font-weight: 600;">
            We've detected unusual activity on your account.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Alert Details:</h3>
          <p style="margin: 0 0 10px 0; color: #666;"><strong>Alert Type:</strong> ${alertType}</p>
          ${details ? `<p style="margin: 0; color: #666;"><strong>Details:</strong> ${details}</p>` : ''}
        </div>
        
        ${actionRequired ? `
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1976d2;">Action Required:</h3>
          <p style="margin: 0; color: #1976d2;">${actionRequired}</p>
        </div>
        ` : ''}
        
        <div style="margin-top: 25px; padding: 15px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
          <p style="margin: 0; color: #721c24; font-size: 14px;">
            <strong>Important:</strong> If you didn't perform this activity, please secure your account immediately by changing your password.
          </p>
        </div>
      `,
      text: `Security Alert - NextGen Ecommerce

Hello ${userName},

We've detected unusual activity on your account.

Alert Details:
Alert Type: ${alertType}
${details ? `Details: ${details}` : ''}

${actionRequired ? `Action Required: ${actionRequired}` : ''}

Important: If you didn't perform this activity, please secure your account immediately by changing your password.

Best regards,
NextGen Ecommerce Team`
    };
  },

  // Admin Contact Form Notification Template
  admin_contact_notification: (data) => {
    const {
      customerName,
      customerEmail,
      customerPhone,
      subject,
      message,
      inquiryType,
      submissionTime,
      siteName,
      siteUrl,
      adminEmail,
      infoColor,
      primaryColor
    } = data;

    return {
      subject: `📧 New Contact Form Submission - ${subject || 'General Inquiry'}`,
      requiredFields: ['customerName', 'customerEmail', 'message'],
      content: `
        <!-- Header Section -->
        <div style="text-align: center; margin-bottom: 40px; padding: 30px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
          <div style="font-size: 48px; margin-bottom: 15px;">📧</div>
          <h2 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 600;">New Contact Form Submission</h2>
          <p style="color: #f0f0f0; margin: 0; font-size: 16px; opacity: 0.9;">You have received a new message from your website contact form</p>
        </div>

        <!-- Alert Section -->
        <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; border-left: 5px solid #ff6b6b;">
          <div style="font-size: 32px; margin-bottom: 10px;">🚨</div>
          <p style="margin: 0; color: #721c24; font-size: 18px; font-weight: 600;">
            Customer inquiry requires your attention
          </p>
        </div>
        
        <div class="alert-info" style="background-color: #d1ecf1; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #0c5460; font-size: 16px; font-weight: 600;">
            Customer inquiry requires your attention
          </p>
        </div>
        
        <!-- Customer Information Section -->
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; border-radius: 12px; margin: 25px 0; border: 2px solid #e0e0e0;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="font-size: 32px; margin-right: 15px;">👤</div>
            <h3 style="margin: 0; color: #2c3e50; font-size: 22px; font-weight: 600;">Customer Information</h3>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.8); padding: 25px; border-radius: 8px; backdrop-filter: blur(10px);">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 12px 0; color: #34495e; font-weight: 600; width: 30%; font-size: 14px;">👤 Name:</td>
                <td style="padding: 12px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${customerName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 12px 0; color: #34495e; font-weight: 600; font-size: 14px;">📧 Email:</td>
                <td style="padding: 12px 0; color: #2c3e50; font-size: 16px;">
                  <a href="mailto:${customerEmail}" style="color: #3498db; text-decoration: none; font-weight: 500; background: rgba(52, 152, 219, 0.1); padding: 4px 8px; border-radius: 4px;">${customerEmail}</a>
                </td>
              </tr>
              ${customerPhone ? `
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 12px 0; color: #34495e; font-weight: 600; font-size: 14px;">📞 Phone:</td>
                <td style="padding: 12px 0; color: #2c3e50; font-size: 16px;">
                  <a href="tel:${customerPhone}" style="color: #27ae60; text-decoration: none; font-weight: 500; background: rgba(39, 174, 96, 0.1); padding: 4px 8px; border-radius: 4px;">${customerPhone}</a>
                </td>
              </tr>
              ` : ''}
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 12px 0; color: #34495e; font-weight: 600; font-size: 14px;">🏷️ Inquiry Type:</td>
                <td style="padding: 12px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">
                  <span style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #721c24; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${inquiryType || 'General'}</span>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 12px 0; color: #34495e; font-weight: 600; font-size: 14px;">📝 Subject:</td>
                <td style="padding: 12px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${subject || 'No subject provided'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #34495e; font-weight: 600; font-size: 14px;">⏰ Submitted:</td>
                <td style="padding: 12px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${submissionTime || new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <!-- Message Section -->
        <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 30px; border-radius: 12px; margin: 25px 0; border: 2px solid #ffb347;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="font-size: 32px; margin-right: 15px;">💬</div>
            <h3 style="margin: 0; color: #8b4513; font-size: 22px; font-weight: 600;">Customer Message</h3>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.9); padding: 25px; border-radius: 8px; border-left: 5px solid #ff6b6b; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <p style="margin: 0; color: #2c3e50; line-height: 1.8; white-space: pre-wrap; font-size: 16px; font-style: italic;">"${message}"</p>
          </div>
        </div>
        
        <!-- Quick Actions Section -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 15px;">⚡</div>
          <h3 style="margin: 0 0 25px 0; color: #ffffff; font-size: 22px; font-weight: 600;">Quick Actions</h3>
          
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <a href="mailto:${customerEmail}?subject=Re: ${subject || 'Your Inquiry'}" 
               style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
                      color: #ffffff; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: 600; 
                      font-size: 16px; 
                      display: inline-block;
                      box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
                      transition: all 0.3s ease;">
              📧 Reply to Customer
            </a>
            <a href="${siteUrl}/admin/contacts" 
               style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); 
                      color: #2c3e50; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: 600; 
                      font-size: 16px; 
                      display: inline-block;
                      box-shadow: 0 6px 20px rgba(168, 237, 234, 0.4);
                      transition: all 0.3s ease;">
              📋 View All Contacts
            </a>
          </div>
        </div>
        
        <div style="margin-top: 25px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Note:</strong> This is an automated notification from your ${siteName} contact form. 
            Please respond to the customer directly using the email address provided above.
          </p>
        </div>
      `,
      text: `New Contact Form Submission - ${subject || 'General Inquiry'}

You have received a new message from your website contact form.

Customer Information:
Name: ${customerName}
Email: ${customerEmail}
${customerPhone ? `Phone: ${customerPhone}` : ''}
Inquiry Type: ${inquiryType || 'General'}
Subject: ${subject || 'No subject provided'}
Submitted: ${submissionTime || new Date().toLocaleString()}

Message:
${message}

Quick Actions:
- Reply to customer: mailto:${customerEmail}?subject=Re: ${subject || 'Your Inquiry'}
- View all contacts: ${siteUrl}/admin/contacts

Note: This is an automated notification from your ${siteName} contact form.

Best regards,
${siteName} System`
    };
  },

  // Thank You Email Template for Contact Form
  thank_you_contact: (data) => {
    const { 
      customerName, 
      customerEmail, 
      subject, 
      inquiryType,
      siteName,
      siteUrl,
      supportEmail,
      phoneNumber,
      businessHoursText,
      successColor,
      infoColor,
      primaryColor
    } = data;
    
    return {
      subject: `Thank You for Contacting ${siteName}`,
      requiredFields: ['customerName'],
      content: `
        <!-- Header Section -->
        <div style="text-align: center; margin-bottom: 40px; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
          <div style="font-size: 64px; margin-bottom: 20px;">🙏</div>
          <h2 style="color: #ffffff; margin: 0 0 15px 0; font-size: 32px; font-weight: 600;">Thank You for Contacting Us!</h2>
          <p style="color: #f0f0f0; margin: 0; font-size: 18px; opacity: 0.9;">Hello ${customerName},</p>
        </div>
        
        <!-- Success Message -->
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center; border: 2px solid #e0e0e0;">
          <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
          <p style="margin: 0; color: #2c3e50; font-size: 20px; font-weight: 600; line-height: 1.4;">
            We've received your <span style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #721c24; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: uppercase;">${inquiryType || 'inquiry'}</span> and will get back to you soon!
          </p>
        </div>
        
        <!-- What Happens Next Section -->
        <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 30px; border-radius: 12px; margin: 25px 0; border: 2px solid #ffb347;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="font-size: 32px; margin-right: 15px;">⏰</div>
            <h3 style="margin: 0; color: #8b4513; font-size: 22px; font-weight: 600;">What Happens Next?</h3>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.9); padding: 25px; border-radius: 8px;">
            <ul style="margin: 0; padding-left: 0; color: #2c3e50; list-style: none;">
              <li style="margin-bottom: 15px; padding-left: 30px; position: relative;">
                <span style="position: absolute; left: 0; font-size: 20px;">📧</span>
                Our team will review your message within <strong style="color: #e74c3c;">24 hours</strong>
              </li>
              <li style="margin-bottom: 15px; padding-left: 30px; position: relative;">
                <span style="position: absolute; left: 0; font-size: 20px;">💌</span>
                We'll respond directly to your email: <strong style="color: #3498db;">${customerEmail}</strong>
              </li>
              <li style="margin-bottom: 15px; padding-left: 30px; position: relative;">
                <span style="position: absolute; left: 0; font-size: 20px;">📞</span>
                For urgent matters, you can call us at <strong style="color: #27ae60;">${phoneNumber}</strong>
              </li>
              <li style="padding-left: 30px; position: relative;">
                <span style="position: absolute; left: 0; font-size: 20px;">🕒</span>
                Our business hours are: <strong style="color: #9b59b6;">${businessHoursText}</strong>
              </li>
            </ul>
          </div>
        </div>
        
        ${subject ? `
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Your Inquiry Summary:</h3>
          <p style="margin: 0 0 10px 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
          <p style="margin: 0; color: #666;"><strong>Type:</strong> ${inquiryType || 'General Inquiry'}</p>
        </div>
        ` : ''}
        
        <!-- While You Wait Section -->
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; border-radius: 12px; margin: 25px 0; border: 2px solid #e0e0e0;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="font-size: 32px; margin-right: 15px;">🌟</div>
            <h3 style="margin: 0; color: #2c3e50; font-size: 22px; font-weight: 600;">While You Wait</h3>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.8); padding: 25px; border-radius: 8px;">
            <p style="margin: 0 0 20px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">
              Explore our website and discover what makes ${siteName} special:
            </p>
            <ul style="margin: 0; padding-left: 0; color: #2c3e50; list-style: none;">
              <li style="margin-bottom: 12px; padding-left: 30px; position: relative;">
                <span style="position: absolute; left: 0; font-size: 18px;">🛍️</span>
                Browse our latest products and services
              </li>
              <li style="margin-bottom: 12px; padding-left: 30px; position: relative;">
                <span style="position: absolute; left: 0; font-size: 18px;">⭐</span>
                Read customer reviews and testimonials
              </li>
              <li style="margin-bottom: 12px; padding-left: 30px; position: relative;">
                <span style="position: absolute; left: 0; font-size: 18px;">❓</span>
                Check out our FAQ section for quick answers
              </li>
              <li style="padding-left: 30px; position: relative;">
                <span style="position: absolute; left: 0; font-size: 18px;">📱</span>
                Follow us on social media for updates
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Call to Action -->
        <div style="margin: 30px 0; text-align: center;">
          <a href="${siteUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: #ffffff; 
                    padding: 18px 40px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: 600; 
                    font-size: 18px; 
                    display: inline-block;
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                    transition: all 0.3s ease;">
            🌐 Visit Our Website
          </a>
        </div>
        
        <!-- Contact Info Section -->
        <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 30px; border-radius: 12px; margin: 25px 0; border: 2px solid #ffb347;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="font-size: 32px; margin-right: 15px;">🆘</div>
            <h3 style="margin: 0; color: #8b4513; font-size: 22px; font-weight: 600;">Need Immediate Help?</h3>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.9); padding: 25px; border-radius: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <span style="font-size: 24px; margin-right: 15px;">📧</span>
              <div>
                <strong style="color: #2c3e50;">Email:</strong> 
                <a href="mailto:${supportEmail}" style="color: #3498db; text-decoration: none; font-weight: 500; background: rgba(52, 152, 219, 0.1); padding: 4px 8px; border-radius: 4px;">${supportEmail}</a>
              </div>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 15px;">📞</span>
              <div>
                <strong style="color: #2c3e50;">Phone:</strong> 
                <a href="tel:${phoneNumber}" style="color: #27ae60; text-decoration: none; font-weight: 500; background: rgba(39, 174, 96, 0.1); padding: 4px 8px; border-radius: 4px;">${phoneNumber}</a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Final Thank You Note -->
        <div style="margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 15px;">💝</div>
          <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 500; line-height: 1.6;">
            <strong>Thank you for choosing ${siteName}!</strong><br>
            We appreciate your interest and look forward to serving you.
          </p>
        </div>
      `,
      text: `Thank You for Contacting ${siteName}

Hello ${customerName},

We've received your ${inquiryType || 'inquiry'} and will get back to you soon!

What happens next?
- Our team will review your message within 24 hours
- We'll respond directly to your email: ${customerEmail}
- For urgent matters, you can call us at ${phoneNumber}
- Our business hours are: ${businessHoursText}

${subject ? `
Your Inquiry Summary:
Subject: ${subject}
Type: ${inquiryType || 'General Inquiry'}
` : ''}

While You Wait:
- Browse our latest products and services
- Read customer reviews and testimonials
- Check out our FAQ section for quick answers
- Follow us on social media for updates

Visit Our Website: ${siteUrl}

Need Immediate Help?
Email: ${supportEmail}
Phone: ${phoneNumber}

Thank you for choosing ${siteName}! We appreciate your interest and look forward to serving you.

Best regards,
The ${siteName} Team`
    };
  }
};
