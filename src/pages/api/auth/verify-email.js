// Verify Email API
// Handles email verification via token or code

import { verifyToken, verifyCode, sendWelcomeEmail, cleanupVerificationData } from '../../../lib/emailVerification';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token, code } = req.body;

    // Validate that either token or code is provided
    if (!token && !code) {
      return res.status(400).json({
        success: false,
        message: 'Either verification token or code is required'
      });
    }

    let verificationResult;

    // Verify using token
    if (token) {
      verificationResult = verifyToken(token);
    }
    // Verify using code
    else if (code) {
      verificationResult = verifyCode(code);
    }

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.error
      });
    }

    const { userData } = verificationResult;

    // Send welcome email after successful verification
    try {
      await sendWelcomeEmail(userData);
    } catch (welcomeError) {
      console.error('Failed to send welcome email:', welcomeError);
      // Don't fail the verification if welcome email fails
    }

    // Clean up verification data
    cleanupVerificationData(userData.email);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      userData: {
        email: userData.email,
        name: userData.name,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}