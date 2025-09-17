// Send Email Verification API
// Handles sending verification emails to users

import { sendVerificationEmail, getVerificationStatus } from '../../../lib/emailVerification';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, name, useCode = false } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Check if there's already a pending verification
    const status = getVerificationStatus(email);
    if (status.hasPendingVerification) {
      return res.status(400).json({
        success: false,
        message: 'A verification email has already been sent. Please check your email or wait before requesting another.',
        canResend: true
      });
    }

    // Prepare user data
    const userData = {
      email: email.toLowerCase().trim(),
      name: name || email.split('@')[0]
    };

    // Send verification email
    const result = await sendVerificationEmail(userData, { useCode });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Verification email sent successfully',
        messageId: result.messageId,
        verificationMethod: useCode ? 'code' : 'link'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Send verification email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
