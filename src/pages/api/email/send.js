import { sendEmail, emailTemplates } from '../../../lib/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type, to, data } = req.body;

  if (!type || !to) {
    return res.status(400).json({ message: 'Type and recipient email are required' });
  }

  try {
    let emailContent;

    switch (type) {
      case 'welcome':
        emailContent = emailTemplates.welcome(data.userName, data.otp);
        break;
      
      case 'password-reset':
        emailContent = emailTemplates.passwordReset(data.userName, data.resetLink);
        break;
      
      case 'password-reset-success':
        emailContent = emailTemplates.passwordResetSuccess(data.userName);
        break;
      
      case 'order-confirmation':
        emailContent = emailTemplates.orderConfirmation(data.userName, data.orderNumber, data.orderDetails);
        break;
      
      default:
        return res.status(400).json({ message: 'Invalid email type' });
    }

    const result = await sendEmail({
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (result.success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
