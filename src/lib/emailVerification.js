// Email Verification Service
// Handles email verification tokens, codes, and verification logic

import crypto from 'crypto';
import { generateEmailTemplate, EMAIL_TEMPLATE_TYPES } from './emailTemplates';
import { sendEmail } from './emailService';

// Verification token storage (in production, use Redis or database)
const verificationTokens = new Map();
const verificationCodes = new Map();

// Token expiration time (24 hours)
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Code expiration time (10 minutes)
const CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Generate a secure verification token
 */
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a 6-digit verification code
 */
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store verification token with user data
 */
export const storeVerificationToken = (token, userData) => {
  const expiryTime = Date.now() + TOKEN_EXPIRY;
  verificationTokens.set(token, {
    ...userData,
    createdAt: Date.now(),
    expiresAt: expiryTime,
    verified: false
  });
  
  // Clean up expired tokens
  cleanupExpiredTokens();
  
  return token;
};

/**
 * Store verification code with user data
 */
export const storeVerificationCode = (code, userData) => {
  const expiryTime = Date.now() + CODE_EXPIRY;
  verificationCodes.set(code, {
    ...userData,
    createdAt: Date.now(),
    expiresAt: expiryTime,
    verified: false
  });
  
  // Clean up expired codes
  cleanupExpiredCodes();
  
  return code;
};

/**
 * Verify token and mark as verified
 */
export const verifyToken = (token) => {
  const tokenData = verificationTokens.get(token);
  
  if (!tokenData) {
    return { success: false, error: 'Invalid or expired verification token' };
  }
  
  if (Date.now() > tokenData.expiresAt) {
    verificationTokens.delete(token);
    return { success: false, error: 'Verification token has expired' };
  }
  
  if (tokenData.verified) {
    return { success: false, error: 'Email already verified' };
  }
  
  // Mark as verified
  tokenData.verified = true;
  tokenData.verifiedAt = Date.now();
  verificationTokens.set(token, tokenData);
  
  return { success: true, userData: tokenData };
};

/**
 * Verify code and mark as verified
 */
export const verifyCode = (code) => {
  const codeData = verificationCodes.get(code);
  
  if (!codeData) {
    return { success: false, error: 'Invalid or expired verification code' };
  }
  
  if (Date.now() > codeData.expiresAt) {
    verificationCodes.delete(code);
    return { success: false, error: 'Verification code has expired' };
  }
  
  if (codeData.verified) {
    return { success: false, error: 'Email already verified' };
  }
  
  // Mark as verified
  codeData.verified = true;
  codeData.verifiedAt = Date.now();
  verificationCodes.set(code, codeData);
  
  return { success: true, userData: codeData };
};

/**
 * Send email verification email
 */
export const sendVerificationEmail = async (userData, options = {}) => {
  const { useCode = false, baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' } = options;
  
  let verificationToken = null;
  let verificationCode = null;
  
  if (useCode) {
    verificationCode = generateVerificationCode();
    storeVerificationCode(verificationCode, userData);
  } else {
    verificationToken = generateVerificationToken();
    storeVerificationToken(verificationToken, userData);
  }
  
  const verificationLink = `${baseUrl}/verify-email?token=${verificationToken || ''}&code=${verificationCode || ''}`;
  
  try {
    const emailTemplate = generateEmailTemplate(EMAIL_TEMPLATE_TYPES.EMAIL_VERIFICATION, {
      userName: userData.name || userData.email,
      verificationLink,
      verificationCode,
      expiresIn: useCode ? '10 minutes' : '24 hours'
    });
    
    const result = await sendEmail({
      to: userData.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });
    
    return {
      success: result.success,
      messageId: result.messageId,
      verificationToken,
      verificationCode,
      verificationLink
    };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send welcome email after verification
 */
export const sendWelcomeEmail = async (userData, options = {}) => {
  const { baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' } = options;
  
  try {
    const emailTemplate = generateEmailTemplate(EMAIL_TEMPLATE_TYPES.WELCOME, {
      userName: userData.name || userData.email,
      loginLink: `${baseUrl}/signin`,
      accountLink: `${baseUrl}/account`
    });
    
    const result = await sendEmail({
      to: userData.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });
    
    return {
      success: result.success,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (email, options = {}) => {
  // Find existing token for this email
  let existingToken = null;
  let existingCode = null;
  
  for (const [token, data] of verificationTokens.entries()) {
    if (data.email === email && !data.verified) {
      existingToken = token;
      break;
    }
  }
  
  for (const [code, data] of verificationCodes.entries()) {
    if (data.email === email && !data.verified) {
      existingCode = code;
      break;
    }
  }
  
  if (existingToken || existingCode) {
    // Use existing token/code
    const userData = existingToken ? verificationTokens.get(existingToken) : verificationCodes.get(existingCode);
    return await sendVerificationEmail(userData, { ...options, useCode: !!existingCode });
  } else {
    return {
      success: false,
      error: 'No pending verification found for this email'
    };
  }
};

/**
 * Clean up expired tokens
 */
const cleanupExpiredTokens = () => {
  const now = Date.now();
  for (const [token, data] of verificationTokens.entries()) {
    if (now > data.expiresAt) {
      verificationTokens.delete(token);
    }
  }
};

/**
 * Clean up expired codes
 */
const cleanupExpiredCodes = () => {
  const now = Date.now();
  for (const [code, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(code);
    }
  }
};

/**
 * Get verification status
 */
export const getVerificationStatus = (email) => {
  // Check tokens
  for (const [token, data] of verificationTokens.entries()) {
    if (data.email === email) {
      return {
        hasPendingVerification: !data.verified,
        isVerified: data.verified,
        expiresAt: data.expiresAt,
        type: 'token'
      };
    }
  }
  
  // Check codes
  for (const [code, data] of verificationCodes.entries()) {
    if (data.email === email) {
      return {
        hasPendingVerification: !data.verified,
        isVerified: data.verified,
        expiresAt: data.expiresAt,
        type: 'code'
      };
    }
  }
  
  return {
    hasPendingVerification: false,
    isVerified: false,
    expiresAt: null,
    type: null
  };
};

/**
 * Delete verification data (after successful verification)
 */
export const cleanupVerificationData = (email) => {
  // Remove from tokens
  for (const [token, data] of verificationTokens.entries()) {
    if (data.email === email) {
      verificationTokens.delete(token);
    }
  }
  
  // Remove from codes
  for (const [code, data] of verificationCodes.entries()) {
    if (data.email === email) {
      verificationCodes.delete(code);
    }
  }
};
