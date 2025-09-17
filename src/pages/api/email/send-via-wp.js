export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type, to, data } = req.body;

  if (!type || !to) {
    return res.status(400).json({ message: 'Type and recipient email are required' });
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local';
    
    // Use WordPress SMTP configuration by calling WordPress email endpoints
    let emailData = {
      to: to,
      type: type,
      data: data
    };

    // Try to send email via WordPress SMTP
    const wpResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (wpResponse.ok) {
      const result = await wpResponse.json();
      return res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully via WordPress SMTP',
        data: result
      });
    } else {
      // Fallback to our SMTP if WordPress fails
      const { sendEmail, emailTemplates } = await import('../../../lib/emailService');
      
      let emailContent;
      switch (type) {
        case 'welcome':
          emailContent = emailTemplates.welcome(data.userName, data.otp);
          break;
        case 'password-reset':
          emailContent = emailTemplates.passwordReset(data.userName, data.resetLink);
          break;
        default:
          emailContent = emailTemplates.welcome(data.userName, data.otp);
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
          message: 'Email sent successfully via fallback SMTP',
          messageId: result.messageId
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to send email via both WordPress and fallback SMTP',
          error: result.error
        });
      }
    }
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
