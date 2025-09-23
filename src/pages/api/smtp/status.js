// Removed getWordPressData import - using direct fetch instead

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Check if SMTP is configured by looking for SMTP settings
    const smtpConfig = await getWordPressData('/wp-json/eternitty/v1/smtp-config');
    
    if (smtpConfig && smtpConfig.enabled) {
      return res.status(200).json({
        success: true,
        message: 'SMTP is configured and ready',
        configured: true,
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'SMTP is not configured',
        configured: false
      });
    }
  } catch (error) {
    console.error('Error checking SMTP status:', error);
    return res.status(200).json({
      success: false,
      message: 'Unable to check SMTP status',
      configured: false,
      error: error.message
    });
  }
}
