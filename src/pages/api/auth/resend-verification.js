// Resend Email Verification API
// Handles resending verification emails

import { resendVerificationEmail, getVerificationStatus } from '../../../lib/emailVerification';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, useCode = false } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Check verification status
    const status = getVerificationStatus(email);
    
    if (!status.hasPendingVerification) {
      return res.status(400).json({
        success: false,
        message: 'No pending verification found for this email address'
      });
    }

    // Resend verification email
    const result = await resendVerificationEmail(email, { useCode });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Verification email resent successfully',
        messageId: result.messageId,
        verificationMethod: useCode ? 'code' : 'link'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to resend verification email'
      });
    }
  } catch (error) {
    console.error('Resend verification email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
