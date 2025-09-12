import { sendEmail } from '../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }

    // Test email sending
    const result = await sendEmail(email, 'verification', {
      user: { 
        email: email, 
        firstName: 'Test User' 
      },
      link: 'https://example.com/verify?token=test123'
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message || 'Failed to send test email',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending test email',
      error: error.message
    });
  }
}
