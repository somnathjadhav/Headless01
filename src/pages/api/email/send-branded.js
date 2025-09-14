import { generateEmailTemplate } from '../../../lib/emailTemplates';
import { sendEmail } from '../../../lib/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      templateType, 
      recipientEmail, 
      recipientName, 
      templateData = {},
      fromEmail,
      fromName
    } = req.body;

    // Validate required fields
    if (!templateType || !recipientEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: templateType and recipientEmail are required' 
      });
    }

    // Generate the email template with branding
    const emailTemplate = await generateEmailTemplate(templateType, {
      ...templateData,
      userName: recipientName || templateData.userName,
      customerName: recipientName || templateData.customerName
    });

    // Prepare email data
    const emailData = {
      to: recipientEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      from: fromEmail || process.env.FROM_EMAIL || 'noreply@example.com',
      fromName: fromName || process.env.FROM_NAME || 'NextGen Ecommerce'
    };

    // Send the email
    const result = await sendEmail(emailData);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        templateType,
        recipientEmail,
        branding: emailTemplate.branding
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send email'
      });
    }

  } catch (error) {
    console.error('Error sending branded email:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
