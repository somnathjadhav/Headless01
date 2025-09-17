import nodemailer from 'nodemailer';

// Email configuration
const getEmailConfig = () => {
  return {
    useWordPressSMTP: process.env.USE_WORDPRESS_SMTP === 'true',
    useDirectSMTP: process.env.USE_DIRECT_SMTP === 'true',
    logEmails: process.env.LOG_EMAILS === 'true',
    wordpressUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }
  };
};

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  const config = getEmailConfig();
  return nodemailer.createTransport(config.smtp);
};

// Verify SMTP connection configuration
export const verifySMTPConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ SMTP server is ready to take our messages');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
};

// Send email function
export const sendEmail = async ({ to, subject, html, text }) => {
  const config = getEmailConfig();
  
  // If logging emails is enabled, just log to console
  if (config.logEmails) {
    console.log('📧 Email would be sent:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Content:', html || text);
    return { success: true, messageId: 'logged-to-console' };
  }
  
  // Try WordPress SMTP first if enabled
  if (config.useWordPressSMTP) {
    try {
      const wpResponse = await fetch(`${config.wordpressUrl}/wp-json/eternitty/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          text
        })
      });

      if (wpResponse.ok) {
        const result = await wpResponse.json();
        console.log('✅ Email sent via WordPress SMTP:', result);
        return { success: true, messageId: result.messageId || 'wp-smtp' };
      }
    } catch (wpError) {
      console.log('⚠️ WordPress SMTP failed, falling back to direct SMTP:', wpError.message);
    }
  }
  
  // Fallback to direct SMTP if enabled
  if (config.useDirectSMTP && config.smtp.host && config.smtp.auth.user) {
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Your Site'}" <${config.smtp.auth.user}>`,
        to,
        subject,
        html,
        text,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent via direct SMTP:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Direct SMTP failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  // If all methods fail, log to console
  console.log('⚠️ All email methods failed, logging to console:');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Content:', html || text);
  return { success: false, error: 'All email methods failed' };
};

// Email templates
export const emailTemplates = {
  welcome: (userName, otp = null) => ({
    subject: 'Welcome to Our Store!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Our Store!</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for signing up with us! We're excited to have you as part of our community.</p>
        ${otp ? `
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Email Verification</h3>
          <p>To complete your registration, please use this verification code:</p>
          <div style="background-color: #007bff; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 4px; letter-spacing: 3px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 10px;">This code will expire in 10 minutes.</p>
        </div>
        ` : ''}
        <p>You can now:</p>
        <ul>
          <li>Browse our products</li>
          <li>Create wishlists</li>
          <li>Track your orders</li>
          <li>Manage your account</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    text: `Welcome to Our Store! Hello ${userName}, Thank you for signing up with us! We're excited to have you as part of our community.${otp ? ` Your verification code is: ${otp}` : ''}`
  }),

  passwordReset: (userName, resetLink) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>We received a request to reset your password. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    text: `Password Reset Request. Hello ${userName}, We received a request to reset your password. Click this link to reset: ${resetLink}`
  }),

  passwordResetSuccess: (userName) => ({
    subject: 'Password Reset Successful',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Password Reset Successful</h2>
        <p>Hello ${userName},</p>
        <p>Your password has been successfully reset.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    text: `Password Reset Successful. Hello ${userName}, Your password has been successfully reset.`
  }),

  orderConfirmation: (userName, orderNumber, orderDetails) => ({
    subject: `Order Confirmation - #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for your order! Your order #${orderNumber} has been confirmed.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <h3>Order Details:</h3>
          ${orderDetails}
        </div>
        <p>We'll send you another email when your order ships.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    text: `Order Confirmation. Hello ${userName}, Thank you for your order! Your order #${orderNumber} has been confirmed.`
  })
};
