import { sendEmail, emailTemplates } from '../../lib/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, testType = 'welcome' } = req.body;

  if (!to) {
    return res.status(400).json({ 
      success: false, 
      message: 'Recipient email is required' 
    });
  }

  try {
    let emailContent;
    
    switch (testType) {
      case 'welcome':
        emailContent = emailTemplates.welcome('Test User', '123456');
        break;
      case 'password-reset':
        emailContent = emailTemplates.passwordReset('Test User', 'https://example.com/reset');
        break;
      default:
        emailContent = emailTemplates.welcome('Test User', '123456');
    }

    const result = await sendEmail({
      to,
      subject: `[TEST] ${emailContent.subject}`,
      html: emailContent.html,
      text: emailContent.text,
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
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ SMTP Test Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during SMTP test',
      error: error.message
    });
  }
}
