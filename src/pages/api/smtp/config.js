import { getWordPressData } from '../../../lib/wordpress-api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get SMTP configuration from WordPress
    const smtpConfig = await getWordPressData('/wp-json/eternitty/v1/smtp-config');
    
    if (smtpConfig) {
      return res.status(200).json({
        success: true,
        config: {
          enabled: smtpConfig.enabled,
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.user ? '***configured***' : null, // Don't expose actual credentials
          from_name: smtpConfig.from_name,
          from_email: smtpConfig.from_email
        }
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'SMTP configuration not available',
        config: null
      });
    }
  } catch (error) {
    console.error('Error loading SMTP config:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load SMTP configuration',
      error: error.message
    });
  }
}
