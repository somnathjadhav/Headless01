const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create transporter
const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not configured. Email sending disabled.');
    return null;
  }

  return nodemailer.createTransport(emailConfig);
};

// Email templates
export const emailTemplates = {
  verification: (user, verificationLink) => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${user.firstName || 'there'}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for signing up! To complete your registration and start using your account, 
            please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${verificationLink}" style="color: #667eea;">${verificationLink}</a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    `,
    text: `
      Welcome ${user.firstName || 'there'}!
      
      Thank you for signing up! To complete your registration, please verify your email address by visiting:
      ${verificationLink}
      
      This link will expire in 24 hours.
      
      If you didn't create an account, please ignore this email.
    `
  }),

  otpVerification: (user, otp) => ({
    subject: 'Your Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${user.firstName || 'there'}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Thank you for signing up! To complete your registration, please use the verification code below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>
          </div>
          <p style="color: #666; line-height: 1.6; font-size: 14px; text-align: center;">
            Enter this code in the verification form to activate your account.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
            This code will expire in 10 minutes. If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    `,
    text: `
      Hi ${user.firstName || 'there'}!
      
      Thank you for signing up! To complete your registration, please use this verification code:
      
      ${otp}
      
      Enter this code in the verification form to activate your account.
      
      This code will expire in 10 minutes.
      
      If you didn't create an account, please ignore this email.
    `
  }),

  passwordReset: (user, resetLink) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${user.firstName || 'there'}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #667eea;">${resetLink}</a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </div>
    `,
    text: `
      Hi ${user.firstName || 'there'}!
      
      We received a request to reset your password. Please visit the following link to create a new password:
      ${resetLink}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email.
    `
  })
};

// Send email function
export const sendEmail = async (to, template, data) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('📧 Email sending disabled - SMTP not configured');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const emailContent = emailTemplates[template](data.user, data.link);
    
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Your Site'}" <${process.env.SMTP_USER}>`,
      to: to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId,
      message: 'Email sent successfully' 
    };
  } catch (error) {
    console.error('📧 Email sending failed:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to send email' 
    };
  }
};

// Generate verification token
export const generateVerificationToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

// Generate reset token
export const generateResetToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

// Generate OTP (6-digit code)
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate OTP with expiration (10 minutes)
export const generateOTPWithExpiration = () => {
  const otp = generateOTP();
  const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
  return { otp, expiresAt };
};

// Validate OTP
export const validateOTP = (inputOTP, storedOTP, expiresAt) => {
  if (!inputOTP || !storedOTP || !expiresAt) {
    return { valid: false, error: 'Invalid OTP data' };
  }
  
  if (Date.now() > expiresAt) {
    return { valid: false, error: 'OTP has expired' };
  }
  
  if (inputOTP !== storedOTP) {
    return { valid: false, error: 'Invalid OTP code' };
  }
  
  return { valid: true };
};
