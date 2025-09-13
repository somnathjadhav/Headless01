export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, backupCodes } = req.body;

    if (!code) {
      return res.status(400).json({ 
        error: 'Verification code is required' 
      });
    }

    // Mock verification for now
    // In a real implementation, this would verify the TOTP code
    if (code.length === 6 && /^\d+$/.test(code)) {
      return res.status(200).json({
        success: true,
        message: '2FA enabled successfully'
      });
    } else {
      return res.status(400).json({
        error: 'Invalid verification code'
      });
    }

  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}
