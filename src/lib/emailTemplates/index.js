// Modular Email Template System
// This system is designed to be scalable for future email types

import { emailTemplates } from './templates';
import { getEmailConfig } from '../emailConfig';

// Base email template with dynamic branding
const getBaseTemplate = (title, content, branding) => ({
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: ${branding.backgroundColor};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .email-header {
          background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%);
          padding: 30px;
          text-align: center;
          color: white;
        }
        
        .email-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 300;
        }
        
        .email-content {
          padding: 40px 30px;
          color: ${branding.textColor};
        }
        
        .email-footer {
          background-color: ${branding.surfaceColor};
          padding: 20px 30px;
          border-top: 1px solid #e9ecef;
          color: ${branding.textSecondaryColor};
          font-size: 14px;
          text-align: center;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          display: inline-block;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .btn-success {
          background: linear-gradient(135deg, ${branding.successColor} 0%, #20c997 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          display: inline-block;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        
        .btn-info {
          background: linear-gradient(135deg, ${branding.infoColor} 0%, #138496 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          display: inline-block;
          box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
        }
        
        .btn-danger {
          background: linear-gradient(135deg, ${branding.errorColor} 0%, #e74c3c 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          display: inline-block;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        
        .alert-success {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .alert-info {
          background-color: #d1ecf1;
          border: 1px solid #bee5eb;
          color: #0c5460;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .alert-warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .alert-danger {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .info-box {
          background-color: ${branding.surfaceColor};
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid ${branding.primaryColor};
        }
        
        .contact-info {
          background-color: ${branding.surfaceColor};
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .contact-info table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .contact-info td {
          padding: 8px 0;
          vertical-align: top;
        }
        
        .contact-info td:first-child {
          color: ${branding.textSecondaryColor};
          font-weight: 600;
          width: 30%;
        }
        
        .contact-info td:last-child {
          color: ${branding.textColor};
        }
        
        .contact-info a {
          color: ${branding.primaryColor};
          text-decoration: none;
        }
        
        .contact-info a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <div class="email-container" style="box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div class="email-header">
          <h1>${branding.siteName}</h1>
        </div>
        
        <!-- Content -->
        <div class="email-content">
          ${content}
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
          <p style="margin: 0;">
            © ${branding.currentYear} ${branding.siteName}. All rights reserved.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px;">
            ${branding.fullAddress}
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px;">
            <a href="mailto:${branding.supportEmail}" style="color: ${branding.primaryColor}; text-decoration: none;">${branding.supportEmail}</a> | 
            <a href="tel:${branding.phoneNumber}" style="color: ${branding.primaryColor}; text-decoration: none;">${branding.phoneNumber}</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
});

// Email template generator with branding
export const generateEmailTemplate = async (templateType, data) => {
  const template = emailTemplates[templateType];
  if (!template) {
    throw new Error(`Email template '${templateType}' not found`);
  }

  // Get branding information
  const { getEmailBranding } = await import('./branding');
  const branding = await getEmailBranding();
  
  // Merge branding with template data
  const templateData = { ...branding, ...data };
  const templateResult = template(templateData);
  
  return {
    subject: templateResult.subject,
    html: getBaseTemplate(templateResult.subject, templateResult.content, branding).html,
    text: templateResult.text || templateResult.content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    branding: branding
  };
};

// Available email template types
export const EMAIL_TEMPLATE_TYPES = {
  // Authentication & Account
  EMAIL_VERIFICATION: 'email_verification',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  PASSWORD_RESET_SUCCESS: 'password_reset_success',
  ACCOUNT_LOCKED: 'account_locked',
  SECURITY_ALERT: 'security_alert',
  
  // E-commerce & Orders
  ORDER_CONFIRMATION: 'order_confirmation',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  
  // Contact & Support
  ADMIN_CONTACT_NOTIFICATION: 'admin_contact_notification',
  THANK_YOU_CONTACT: 'thank_you_contact'
};

// Email template registry for easy management
export const getAvailableTemplates = () => {
  return Object.keys(emailTemplates);
};

// Validate email template data
export const validateTemplateData = (templateType, data) => {
  const template = emailTemplates[templateType];
  if (!template) {
    return { valid: false, error: `Template '${templateType}' not found` };
  }

  if (template.requiredFields) {
    for (const field of template.requiredFields) {
      if (!data[field]) {
        return { valid: false, error: `Required field '${field}' is missing` };
      }
    }
  }

  return { valid: true };
};
