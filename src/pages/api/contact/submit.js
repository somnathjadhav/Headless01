import { contactSchema, validateWithZod } from '../../../lib/zodSchemas';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body using Zod
    const validation = validateWithZod(contactSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const { name, email, phone, subject, message, inquiryType } = validation.data;

    // Try to submit to WordPress backend first
    try {
      const wpResponse = await fetch(`${process.env.WORDPRESS_URL}/wp-json/eternitty/v1/contact-submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || '',
          subject,
          message,
          inquiryType: inquiryType || 'general',
          timestamp: new Date().toISOString(),
          userAgent: req.headers['user-agent'] || '',
          ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown'
        })
      });

      if (wpResponse.ok) {
        const wpData = await wpResponse.json();
        return res.status(200).json({
          success: true,
          message: 'Message sent successfully',
          submissionId: wpData.id,
          source: 'wordpress'
        });
      }
    } catch (error) {
      console.log('WordPress backend not accessible, using fallback');
    }

    // Fallback: Log the contact form submission
    const contactSubmission = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      subject,
      message,
      inquiryType: inquiryType || 'general',
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown',
      status: 'pending'
    };

    // In a real application, you would save this to a database
    console.log('Contact form submission (WordPress backend not accessible):', contactSubmission);

    // Send branded emails using the new email system
    const emailSent = await sendContactEmails(contactSubmission);

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: 'Message sent successfully (WordPress backend not accessible)',
        submissionId: contactSubmission.id,
        source: 'fallback'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: error.message
    });
  }
}

    // Send branded emails using the new email system
    async function sendContactEmails(contactSubmission) {
      try {
        const { generateEmailTemplate } = await import('../../../lib/emailTemplates');
        const { sendEmail } = await import('../../../lib/emailService');

        // Send admin notification email
        const adminEmailTemplate = await generateEmailTemplate('admin_contact_notification', {
          customerName: contactSubmission.name,
          customerEmail: contactSubmission.email,
          customerPhone: contactSubmission.phone,
          subject: contactSubmission.subject,
          message: contactSubmission.message,
          inquiryType: contactSubmission.inquiryType,
          submissionTime: new Date(contactSubmission.timestamp).toLocaleString()
        });

        const adminEmailData = {
          to: process.env.ADMIN_EMAIL || 'admin@example.com',
          subject: adminEmailTemplate.subject,
          html: adminEmailTemplate.html,
          text: adminEmailTemplate.text,
          from: process.env.FROM_EMAIL || 'noreply@example.com',
          fromName: process.env.FROM_NAME || 'Contact Form'
        };

        const adminEmailResult = await sendEmail(adminEmailData);
        console.log('Admin notification email sent:', adminEmailResult.success);

        // Send thank you email to customer
        const thankYouTemplate = await generateEmailTemplate('thank_you_contact', {
          customerName: contactSubmission.name,
          customerEmail: contactSubmission.email,
          subject: contactSubmission.subject,
          inquiryType: contactSubmission.inquiryType
        });

        const thankYouEmailData = {
          to: contactSubmission.email,
          subject: thankYouTemplate.subject,
          html: thankYouTemplate.html,
          text: thankYouTemplate.text,
          from: process.env.FROM_EMAIL || 'noreply@example.com',
          fromName: process.env.FROM_NAME || 'Contact Form'
        };

        const thankYouEmailResult = await sendEmail(thankYouEmailData);
        console.log('Thank you email sent:', thankYouEmailResult.success);

        return adminEmailResult.success && thankYouEmailResult.success;
      } catch (error) {
        console.error('Error sending contact emails:', error);
        return false;
      }
    }
