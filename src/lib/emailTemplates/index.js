// Modular Email Template System
// This system is designed to be scalable for future email types

import { emailTemplates } from './templates';
import { getEmailConfig } from '../emailConfig';

// Base email template with consistent styling
const getBaseTemplate = (title, content, footerText = 'NextGen Ecommerce') => ({
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">
            NextGen Ecommerce
          </h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          ${content}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #6c757d; font-size: 14px; text-align: center;">
            ${footerText}
          </p>
          <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px; text-align: center;">
            221B MG Road, Sector 14, Pune 411001, Maharashtra, India
          </p>
        </div>
      </div>
    </body>
    </html>
  `
});

// Email template generator
export const generateEmailTemplate = (templateType, data) => {
  const template = emailTemplates[templateType];
  if (!template) {
    throw new Error(`Email template '${templateType}' not found`);
  }

  const { subject, content, text } = template(data);
  
  return {
    subject,
    html: getBaseTemplate(subject, content),
    text: text || content.replace(/<[^>]*>/g, '') // Strip HTML for text version
  };
};

// Available email template types
export const EMAIL_TEMPLATE_TYPES = {
  EMAIL_VERIFICATION: 'email_verification',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  PASSWORD_RESET_SUCCESS: 'password_reset_success',
  ORDER_CONFIRMATION: 'order_confirmation',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  ACCOUNT_LOCKED: 'account_locked',
  SECURITY_ALERT: 'security_alert'
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
