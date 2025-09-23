import { getWordPressData } from '../../../lib/wordpress-api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Test email address is required'
      });
    }

    // Send test email through WordPress backend
    const testResult = await getWordPressData('/wp-json/eternitty/v1/send-email', {
      method: 'POST',
      body: JSON.stringify({
        to: testEmail,
        subject: 'SMTP Test Email - Frontend Admin',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px;">✅ SMTP Test Successful!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Test Email Details</h2>
              <p><strong>Sent from:</strong> Frontend Admin Dashboard</p>
              <p><strong>Sent to:</strong> ${testEmail}</p>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">SUCCESS</span></p>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                <strong>🎉 Congratulations!</strong> Your SMTP configuration is working correctly. 
                Email functionality is now available for user verification, password resets, and order notifications.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                This is an automated test email from your Headless WooCommerce Frontend Admin Dashboard.
              </p>
            </div>
          </div>
        `,
        text: `SMTP Test Successful!

Hello,

This is a test email to verify that your SMTP configuration is working correctly.

Test Details:
- Sent from: Frontend Admin Dashboard
- Sent to: ${testEmail}
- Timestamp: ${new Date().toLocaleString()}
- Status: SUCCESS

Congratulations! Your SMTP configuration is working correctly. Email functionality is now available for user verification, password resets, and order notifications.

This is an automated test email from your Headless WooCommerce Frontend Admin Dashboard.`
      })
    });

    if (testResult && testResult.success) {
      return res.status(200).json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: testResult.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        message: testResult?.message || 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
}
