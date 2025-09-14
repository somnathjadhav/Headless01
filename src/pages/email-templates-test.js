import React, { useState } from 'react';
import { generateEmailTemplate, EMAIL_TEMPLATE_TYPES } from '../lib/emailTemplates';

export default function EmailTemplatesTest() {
  const [selectedTemplate, setSelectedTemplate] = useState(EMAIL_TEMPLATE_TYPES.EMAIL_VERIFICATION);
  const [templateData, setTemplateData] = useState({
    userName: 'John Doe',
    verificationLink: 'https://example.com/verify?token=abc123',
    verificationCode: '123456',
    expiresIn: '24 hours',
    resetLink: 'https://example.com/reset?token=xyz789',
    orderNumber: 'ORD-2024-001',
    orderDetails: '<p>Product: Sample Product</p><p>Quantity: 2</p><p>Price: $29.99</p>',
    totalAmount: '$59.98',
    // Contact form templates data
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '+1 (555) 123-4567',
    subject: 'Product Inquiry',
    message: 'Hi, I\'m interested in your premium products. Could you please provide more information about pricing and availability? I\'m looking to make a bulk purchase for my business.',
    inquiryType: 'sales',
    submissionTime: new Date().toLocaleString()
  });

  const handleTemplateChange = (templateType) => {
    setSelectedTemplate(templateType);
  };

  const handleDataChange = (field, value) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTemplatePreview = () => {
    try {
      // Create a simple template preview without WordPress API calls
      const template = generateSimpleEmailTemplate(selectedTemplate, templateData);
      return template.html;
    } catch (error) {
      console.error('Template generation error:', error);
      return `<div style="color: red; padding: 20px;">Error: ${error.message}</div>`;
    }
  };

  // Simple email template generator for testing
  const generateSimpleEmailTemplate = (templateType, data) => {
    
    const branding = {
      siteName: 'NextGen Ecommerce',
      primaryColor: '#2563eb', // Professional blue
      secondaryColor: '#1d4ed8', // Darker blue
      accentColor: '#3b82f6', // Light blue
      successColor: '#10b981',
      infoColor: '#06b6d4',
      errorColor: '#ef4444',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      textSecondaryColor: '#6b7280',
      surfaceColor: '#f9fafb',
      borderColor: '#e5e7eb',
      currentYear: new Date().getFullYear(),
      fullAddress: '123 Business Street, Suite 100, New York, NY 10001, United States',
      supportEmail: 'support@example.com',
      phoneNumber: '+1 (555) 123-4567',
      businessHoursText: 'Monday - Friday: 9:00 AM - 6:00 PM EST'
    };

    const templateData = { ...branding, ...data };
    
    // Import the email templates directly
    const emailTemplates = {
      welcome: (data) => {
        const { userName, loginLink, accountLink, siteName, primaryColor, secondaryColor } = data;
        return {
          subject: `Welcome to ${siteName}!`,
          requiredFields: ['userName'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2c3e50;">Welcome to ${siteName}!</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #2c3e50;">Hello ${userName},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
              We're thrilled to have you join our community! Your account has been successfully created and you can now start shopping.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginLink || '#'}" 
                 style="background-color: #007bff; 
                        color: #ffffff; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 4px; 
                        font-weight: 500; 
                        font-size: 16px; 
                        display: inline-block;
                        border: 1px solid #007bff;">
                Get Started
              </a>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: #2c3e50;">
              Thank you,<br>
              The ${siteName} Team
            </p>
          `,
          text: `Welcome to ${siteName}!\n\nHello ${userName},\n\nWe're thrilled to have you join our community! Your account has been successfully created.\n\nGet started: ${loginLink || '#'}\n\nBest regards,\n${siteName} Team`
        };
      },
      password_reset: (data) => {
        const { userName, resetLink, expiresIn = '24 hours', siteName, primaryColor, secondaryColor } = data;
        return {
          subject: `Reset Your Password - ${siteName}`,
          requiredFields: ['userName', 'resetLink'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2c3e50;">Reset Your Password</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #2c3e50;">Hello ${userName},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #007bff; 
                        color: #ffffff; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 4px; 
                        font-weight: 500; 
                        font-size: 16px; 
                        display: inline-block;
                        border: 1px solid #007bff;">
                Reset Password
              </a>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #6c757d;">
              This link will expire in ${expiresIn}. If you didn't request this, please ignore this email.
            </p>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: #2c3e50;">
              Thank you,<br>
              The ${siteName} Team
            </p>
          `,
          text: `Reset Your Password - ${siteName}\n\nHello ${userName},\n\nWe received a request to reset your password. Click the link below to create a new password.\n\nReset Link: ${resetLink}\n\nThis link will expire in ${expiresIn}.\n\nBest regards,\n${siteName} Team`
        };
      },
      order_confirmation: (data) => {
        const { customerName, orderNumber, orderTotal, orderDate, siteName, primaryColor, secondaryColor } = data;
        return {
          subject: `Order Confirmed - #${orderNumber}`,
          requiredFields: ['customerName', 'orderNumber'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: ${branding.primaryColor};">Order Confirmed!</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: ${branding.textColor};">Hello ${customerName},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: ${branding.textColor}; line-height: 1.6;">
              Thank you for your order! We've received your payment and your order is being processed.
            </p>
            
            <div style="background-color: ${branding.surfaceColor}; padding: 20px; border: 1px solid ${branding.borderColor}; border-radius: 4px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: ${branding.primaryColor};">Order Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid ${branding.borderColor};">
                  <td style="padding: 8px 0; color: ${branding.textSecondaryColor}; font-weight: 600; width: 30%; font-size: 14px;">Order #:</td>
                  <td style="padding: 8px 0; color: ${branding.textColor}; font-size: 16px; font-weight: 500;">${orderNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid ${branding.borderColor};">
                  <td style="padding: 8px 0; color: ${branding.textSecondaryColor}; font-weight: 600; font-size: 14px;">Total:</td>
                  <td style="padding: 8px 0; color: ${branding.textColor}; font-size: 16px; font-weight: 500;">${orderTotal || '$99.99'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${branding.textSecondaryColor}; font-weight: 600; font-size: 14px;">Date:</td>
                  <td style="padding: 8px 0; color: ${branding.textColor}; font-size: 16px; font-weight: 500;">${orderDate || new Date().toLocaleDateString()}</td>
                </tr>
              </table>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: ${branding.textColor};">
              Thank you,<br>
              The ${siteName} Team
            </p>
          `,
          text: `Order Confirmed - #${orderNumber}\n\nHello ${customerName},\n\nYour order has been confirmed!\n\nOrder #: ${orderNumber}\nTotal: ${orderTotal || '$99.99'}\nDate: ${orderDate || new Date().toLocaleDateString()}\n\nBest regards,\n${siteName} Team`
        };
      },
      email_verification: (data) => {
        const { userName, verificationLink, verificationCode, expiresIn = '24 hours', siteName, primaryColor, secondaryColor } = data;
        return {
          subject: `Verify Your Email Address - ${siteName}`,
          requiredFields: ['userName', 'verificationLink'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: ${branding.primaryColor};">Verify Your Email Address</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: ${branding.textColor};">Hello ${userName},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: ${branding.textColor}; line-height: 1.6;">
              Thank you for signing up! Please verify your email address to complete your registration and start shopping.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: ${branding.primaryColor}; 
                        color: #ffffff; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 4px; 
                        font-weight: 500; 
                        font-size: 16px; 
                        display: inline-block;
                        border: 1px solid ${branding.primaryColor};">
                Verify Email Address
              </a>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: ${branding.textSecondaryColor};">
              This link will expire in ${expiresIn}. If you didn't create an account, please ignore this email.
            </p>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: ${branding.textColor};">
              Thank you,<br>
              The ${siteName} Team
            </p>
          `,
          text: `Verify Your Email Address - ${siteName}\n\nHello ${userName},\n\nThank you for signing up! Please verify your email address to complete your registration.\n\nVerification Link: ${verificationLink}\n\nThis link will expire in ${expiresIn}.\n\nBest regards,\n${siteName} Team`
        };
      },
      admin_contact_notification: (data) => {
        const { customerName, customerEmail, customerPhone, subject, message, inquiryType, submissionTime, siteName } = data;
        return {
          subject: `New Contact Form Submission - ${subject || 'General Inquiry'}`,
          requiredFields: ['customerName', 'customerEmail', 'message'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: ${branding.primaryColor};">New Contact Form Submission</h2>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: ${branding.textColor}; line-height: 1.6;">
              You have received a new message from your website contact form.
            </p>
            
            <div style="background-color: ${branding.surfaceColor}; padding: 20px; border: 1px solid ${branding.borderColor}; border-radius: 4px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: ${branding.primaryColor};">Customer Information</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid ${branding.borderColor};">
                  <td style="padding: 8px 0; color: ${branding.textSecondaryColor}; font-weight: 600; width: 30%; font-size: 14px;">Name:</td>
                  <td style="padding: 8px 0; color: ${branding.textColor}; font-size: 16px;">${customerName}</td>
                </tr>
                <tr style="border-bottom: 1px solid ${branding.borderColor};">
                  <td style="padding: 8px 0; color: ${branding.textSecondaryColor}; font-weight: 600; font-size: 14px;">Email:</td>
                  <td style="padding: 8px 0; color: ${branding.textColor}; font-size: 16px;">
                    <a href="mailto:${customerEmail}" style="color: ${branding.primaryColor}; text-decoration: none;">${customerEmail}</a>
                  </td>
                </tr>
                ${customerPhone ? `
                <tr style="border-bottom: 1px solid ${branding.borderColor};">
                  <td style="padding: 8px 0; color: ${branding.textSecondaryColor}; font-weight: 600; font-size: 14px;">Phone:</td>
                  <td style="padding: 8px 0; color: ${branding.textColor}; font-size: 16px;">
                    <a href="tel:${customerPhone}" style="color: ${branding.primaryColor}; text-decoration: none;">${customerPhone}</a>
                  </td>
                </tr>
                ` : ''}
                <tr style="border-bottom: 1px solid ${branding.borderColor};">
                  <td style="padding: 8px 0; color: ${branding.textSecondaryColor}; font-weight: 600; font-size: 14px;">Inquiry Type:</td>
                  <td style="padding: 8px 0; color: ${branding.textColor}; font-size: 16px;">${inquiryType || 'General'}</td>
                </tr>
                <tr style="border-bottom: 1px solid ${branding.borderColor};">
                  <td style="padding: 8px 0; color: ${branding.textSecondaryColor}; font-weight: 600; font-size: 14px;">Subject:</td>
                  <td style="padding: 8px 0; color: ${branding.textColor}; font-size: 16px;">${subject || 'No subject provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${branding.textSecondaryColor}; font-weight: 600; font-size: 14px;">Submitted:</td>
                  <td style="padding: 8px 0; color: ${branding.textColor}; font-size: 16px;">${submissionTime || new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: ${branding.surfaceColor}; padding: 20px; border: 1px solid ${branding.borderColor}; border-radius: 4px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: ${branding.primaryColor};">Customer Message</h3>
              <p style="margin: 0; color: ${branding.textColor}; line-height: 1.6; white-space: pre-wrap; font-size: 16px;">${message}</p>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: ${branding.textColor};">
              Best regards,<br>
              ${siteName} System
            </p>
          `,
          text: `New Contact Form Submission - ${subject || 'General Inquiry'}\n\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone || 'Not provided'}\nSubject: ${subject || 'No subject'}\nMessage: ${message}\n\nSubmitted: ${submissionTime || new Date().toLocaleString()}`
        };
      },
      thank_you_contact: (data) => {
        const { customerName, customerEmail, subject, inquiryType, siteName } = data;
        return {
          subject: `Thank You for Your Message - ${siteName}`,
          requiredFields: ['customerName', 'customerEmail'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2c3e50;">Thank You for Your Message!</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #2c3e50;">Hello ${customerName},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
              We've received your ${inquiryType || 'inquiry'} and will get back to you soon. We appreciate you taking the time to contact us.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
                <strong>What happens next?</strong><br>
                Our team will review your message and respond within 24 hours during business days.
              </p>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: #2c3e50;">
              Thank you,<br>
              The ${siteName} Team
            </p>
          `,
          text: `Thank You for Your Message - ${siteName}\n\nHello ${customerName},\n\nWe've received your ${inquiryType || 'inquiry'} and will get back to you soon!\n\nBest regards,\n${siteName} Team`
        };
      },
      password_reset_success: (data) => {
        const { userName, siteName, primaryColor, secondaryColor } = data;
        return {
          subject: `Password Reset Successful - ${siteName}`,
          requiredFields: ['userName'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2c3e50;">Password Reset Successful!</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #2c3e50;">Hello ${userName},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
                <strong>Security Tip:</strong> Keep your password secure and don't share it with anyone.
              </p>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: #2c3e50;">
              Thank you,<br>
              The ${siteName} Team
            </p>
          `,
          text: `Password Reset Successful - ${siteName}\n\nHello ${userName},\n\nYour password has been successfully reset. You can now log in with your new password.\n\nBest regards,\n${siteName} Team`
        };
      },
      account_locked: (data) => {
        const { userName, unlockLink, siteName, primaryColor, secondaryColor } = data;
        return {
          subject: `Account Locked - ${siteName}`,
          requiredFields: ['userName'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2c3e50;">Account Locked</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #2c3e50;">Hello ${userName},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
              Your account has been temporarily locked due to multiple failed login attempts.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
                <strong>Security Notice:</strong> This is a security measure to protect your account from unauthorized access.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${unlockLink || '#'}" 
                 style="background-color: #007bff; 
                        color: #ffffff; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 4px; 
                        font-weight: 500; 
                        font-size: 16px; 
                        display: inline-block;
                        border: 1px solid #007bff;">
                Unlock Account
              </a>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: #2c3e50;">
              Thank you,<br>
              The ${siteName} Team
            </p>
          `,
          text: `Account Locked - ${siteName}\n\nHello ${userName},\n\nYour account has been temporarily locked due to multiple failed login attempts.\n\nUnlock your account: ${unlockLink || '#'}\n\nBest regards,\n${siteName} Team`
        };
      },
      security_alert: (data) => {
        const { userName, loginTime, location, device, siteName, primaryColor, secondaryColor } = data;
        return {
          subject: `Security Alert - ${siteName}`,
          requiredFields: ['userName'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2c3e50;">Security Alert</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #2c3e50;">Hello ${userName},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
              We detected suspicious activity on your account. Please review the details below.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-radius: 4px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #2c3e50;">Activity Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; width: 30%; font-size: 14px;">Time:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px;">${loginTime || new Date().toLocaleString()}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; font-size: 14px;">Location:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px;">${location || 'Unknown'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; font-size: 14px;">Device:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px;">${device || 'Unknown'}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
                <strong>Important:</strong> If this was you, no action is needed. If not, please secure your account immediately by changing your password.
              </p>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: #2c3e50;">
              Best regards,<br>
              The ${siteName} Security Team
            </p>
          `,
          text: `Security Alert - ${siteName}\n\nHello ${userName},\n\nWe detected suspicious activity on your account.\n\nTime: ${loginTime || new Date().toLocaleString()}\nLocation: ${location || 'Unknown'}\nDevice: ${device || 'Unknown'}\n\nIf this was you, no action is needed. If not, please secure your account immediately.\n\nBest regards,\n${siteName} Team`
        };
      },
      order_shipped: (data) => {
        const { customerName, orderNumber, trackingNumber, estimatedDelivery, siteName, primaryColor, secondaryColor } = data;
        return {
          subject: `Your Order Has Shipped - #${orderNumber}`,
          requiredFields: ['customerName', 'orderNumber'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2c3e50;">Your Order Has Shipped!</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #2c3e50;">Hello ${customerName},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
              Great news! Your order has been shipped and is on its way to you.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-radius: 4px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #2c3e50;">Shipping Information</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; width: 30%; font-size: 14px;">Order #:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${orderNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; font-size: 14px;">Tracking #:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${trackingNumber || 'TRK123456789'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; font-size: 14px;">Est. Delivery:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${estimatedDelivery || '3-5 business days'}</td>
                </tr>
              </table>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: #2c3e50;">
              Thank you,<br>
              The ${siteName} Team
            </p>
          `,
          text: `Your Order Has Shipped - #${orderNumber}\n\nHello ${customerName},\n\nGreat news! Your order has been shipped and is on its way to you.\n\nOrder #: ${orderNumber}\nTracking #: ${trackingNumber || 'TRK123456789'}\nEstimated Delivery: ${estimatedDelivery || '3-5 business days'}\n\nBest regards,\n${siteName} Team`
        };
      },
      order_delivered: (data) => {
        const { customerName, orderNumber, deliveryDate, siteName, primaryColor, secondaryColor } = data;
        return {
          subject: `Order Delivered - #${orderNumber}`,
          requiredFields: ['customerName', 'orderNumber'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2c3e50;">Order Delivered!</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #2c3e50;">Hello ${customerName},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
              Great news! Your order has been successfully delivered.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-radius: 4px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #2c3e50;">Delivery Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; width: 30%; font-size: 14px;">Order #:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; font-size: 14px;">Delivered on:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${deliveryDate || new Date().toLocaleDateString()}</td>
                </tr>
              </table>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: #2c3e50;">
              Thank you,<br>
              The ${siteName} Team
            </p>
          `,
          text: `Order Delivered - #${orderNumber}\n\nHello ${customerName},\n\nGreat news! Your order has been successfully delivered.\n\nOrder #: ${orderNumber}\nDelivered on: ${deliveryDate || new Date().toLocaleDateString()}\n\nBest regards,\n${siteName} Team`
        };
      },
      order_cancelled: (data) => {
        const { customerName, orderNumber, reason, refundAmount, siteName, primaryColor, secondaryColor } = data;
        return {
          subject: `Order Cancelled - #${orderNumber}`,
          requiredFields: ['customerName', 'orderNumber'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2c3e50;">Order Cancelled</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #2c3e50;">Hello ${customerName},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
              We're sorry to inform you that your order has been cancelled.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-radius: 4px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #2c3e50;">Cancellation Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; width: 30%; font-size: 14px;">Order #:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${orderNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; font-size: 14px;">Reason:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${reason || 'Customer request'}</td>
                </tr>
                ${refundAmount ? `
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; font-size: 14px;">Refund:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${refundAmount}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: #2c3e50;">
              Thank you,<br>
              The ${siteName} Team
            </p>
          `,
          text: `Order Cancelled - #${orderNumber}\n\nHello ${customerName},\n\nYour order has been cancelled.\n\nOrder #: ${orderNumber}\nReason: ${reason || 'Customer request'}\n${refundAmount ? `Refund: ${refundAmount}` : ''}\n\nBest regards,\n${siteName} Team`
        };
      },
      payment_success: (data) => {
        const { customerName, orderNumber, amount, paymentMethod, siteName, primaryColor, secondaryColor } = data;
        return {
          subject: `Payment Successful - #${orderNumber}`,
          requiredFields: ['customerName', 'orderNumber'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2c3e50;">Payment Successful!</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #2c3e50;">Hello ${customerName},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
              Your payment has been processed successfully!
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-radius: 4px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #2c3e50;">Payment Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; width: 30%; font-size: 14px;">Order #:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${orderNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; font-size: 14px;">Amount:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${amount || '$99.99'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; font-size: 14px;">Method:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${paymentMethod || 'Credit Card'}</td>
                </tr>
              </table>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: #2c3e50;">
              Thank you,<br>
              The ${siteName} Team
            </p>
          `,
          text: `Payment Successful - #${orderNumber}\n\nHello ${customerName},\n\nYour payment has been processed successfully!\n\nOrder #: ${orderNumber}\nAmount: ${amount || '$99.99'}\nPayment Method: ${paymentMethod || 'Credit Card'}\n\nBest regards,\n${siteName} Team`
        };
      },
      payment_failed: (data) => {
        const { customerName, orderNumber, amount, reason, siteName, primaryColor, secondaryColor } = data;
        return {
          subject: `Payment Failed - #${orderNumber}`,
          requiredFields: ['customerName', 'orderNumber'],
          content: `
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2c3e50;">Payment Failed</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #2c3e50;">Hello ${customerName},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #2c3e50; line-height: 1.6;">
              Unfortunately, your payment could not be processed. Please try again or contact support.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-radius: 4px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #2c3e50;">Payment Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; width: 30%; font-size: 14px;">Order #:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${orderNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; font-size: 14px;">Amount:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${amount || '$99.99'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; font-size: 14px;">Reason:</td>
                  <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 500;">${reason || 'Insufficient funds'}</td>
                </tr>
              </table>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: #2c3e50;">
              Thank you,<br>
              The ${siteName} Team
            </p>
          `,
          text: `Payment Failed - #${orderNumber}\n\nHello ${customerName},\n\nUnfortunately, your payment could not be processed.\n\nOrder #: ${orderNumber}\nAmount: ${amount || '$99.99'}\nReason: ${reason || 'Insufficient funds'}\n\nPlease try again or contact support.\n\nBest regards,\n${siteName} Team`
        };
      }
    };
    
    const template = emailTemplates[templateType];
    
    if (!template) {
      throw new Error(`Template '${templateType}' not found`);
    }

    const templateResult = template(templateData);
    
    // Create a simple base template
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${templateResult.subject}</title>
        <style>
          body { margin: 0; padding: 20px; background-color: ${branding.surfaceColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .email-container { max-width: 600px; margin: 0 auto; background-color: ${branding.backgroundColor}; border: 1px solid ${branding.borderColor}; border-radius: 8px; overflow: hidden; }
          .email-header { background-color: ${branding.backgroundColor}; padding: 30px; text-align: center; border-bottom: 1px solid ${branding.borderColor}; }
          .email-header .logo { max-width: 120px; height: auto; margin-bottom: 15px; }
          .email-header h1 { margin: 0; font-size: 24px; font-weight: 600; color: ${branding.primaryColor}; }
          .email-content { padding: 30px; color: ${branding.textColor}; line-height: 1.6; }
          .email-footer { background-color: ${branding.surfaceColor}; padding: 20px 30px; border-top: 1px solid ${branding.borderColor}; color: ${branding.textSecondaryColor}; font-size: 14px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <img src="http://localhost:10008/wp-content/uploads/2025/09/logoipsum-373.svg" alt="${branding.siteName} Logo" class="logo" />
            <h1>${branding.siteName}</h1>
          </div>
          <div class="email-content">
            ${templateResult.content}
          </div>
          <div class="email-footer">
            <p style="margin: 0;">© ${branding.currentYear} ${branding.siteName}. All rights reserved.</p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">${branding.fullAddress}</p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">
              <a href="mailto:${branding.supportEmail}" style="color: ${branding.primaryColor}; text-decoration: none;">${branding.supportEmail}</a> | 
              <a href="tel:${branding.phoneNumber}" style="color: ${branding.primaryColor}; text-decoration: none;">${branding.phoneNumber}</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      subject: templateResult.subject,
      html: baseTemplate,
      text: templateResult.text || templateResult.content.replace(/<[^>]*>/g, '')
    };
  };

  const getTemplateFields = () => {
    switch (selectedTemplate) {
      case EMAIL_TEMPLATE_TYPES.EMAIL_VERIFICATION:
        return [
          { key: 'userName', label: 'User Name', type: 'text' },
          { key: 'verificationLink', label: 'Verification Link', type: 'url' },
          { key: 'verificationCode', label: 'Verification Code', type: 'text' },
          { key: 'expiresIn', label: 'Expires In', type: 'text' }
        ];
      case EMAIL_TEMPLATE_TYPES.WELCOME:
        return [
          { key: 'userName', label: 'User Name', type: 'text' },
          { key: 'loginLink', label: 'Login Link', type: 'url' },
          { key: 'accountLink', label: 'Account Link', type: 'url' }
        ];
      case EMAIL_TEMPLATE_TYPES.PASSWORD_RESET:
        return [
          { key: 'userName', label: 'User Name', type: 'text' },
          { key: 'resetLink', label: 'Reset Link', type: 'url' },
          { key: 'expiresIn', label: 'Expires In', type: 'text' }
        ];
      case EMAIL_TEMPLATE_TYPES.ORDER_CONFIRMATION:
        return [
          { key: 'userName', label: 'User Name', type: 'text' },
          { key: 'orderNumber', label: 'Order Number', type: 'text' },
          { key: 'orderDetails', label: 'Order Details', type: 'textarea' },
          { key: 'totalAmount', label: 'Total Amount', type: 'text' }
        ];
      case EMAIL_TEMPLATE_TYPES.ADMIN_CONTACT_NOTIFICATION:
        return [
          { key: 'customerName', label: 'Customer Name', type: 'text' },
          { key: 'customerEmail', label: 'Customer Email', type: 'email' },
          { key: 'customerPhone', label: 'Customer Phone', type: 'text' },
          { key: 'subject', label: 'Subject', type: 'text' },
          { key: 'message', label: 'Message', type: 'textarea' },
          { key: 'inquiryType', label: 'Inquiry Type', type: 'text' },
          { key: 'submissionTime', label: 'Submission Time', type: 'text' }
        ];
      case EMAIL_TEMPLATE_TYPES.THANK_YOU_CONTACT:
        return [
          { key: 'customerName', label: 'Customer Name', type: 'text' },
          { key: 'customerEmail', label: 'Customer Email', type: 'email' },
          { key: 'subject', label: 'Subject', type: 'text' },
          { key: 'inquiryType', label: 'Inquiry Type', type: 'text' }
        ];
      default:
        return [];
    }
  };

  return (
    <>
      <style jsx>{`
        .email-preview a {
          cursor: pointer !important;
          pointer-events: auto !important;
          text-decoration: none !important;
        }
        .email-preview a:hover {
          text-decoration: underline !important;
        }
        .email-preview button {
          cursor: pointer !important;
          pointer-events: auto !important;
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Email Templates Test</h1>
            <p className="text-gray-600 mt-1">Preview and test all email templates including contact form, authentication, and order processing templates</p>
          </div>

          <div className="flex">
            {/* Left Sidebar - Template Selection */}
            <div className="w-1/4 border-r border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Template</h2>
              
              {/* Authentication & Account Templates */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  🔐 Authentication & Account
                </h3>
                <div className="space-y-1">
                  {Object.entries(EMAIL_TEMPLATE_TYPES)
                    .filter(([key, value]) => 
                      value.includes('verification') || 
                      value.includes('welcome') || 
                      value.includes('password') || 
                      value.includes('account') || 
                      value.includes('security')
                    )
                    .map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleTemplateChange(value)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedTemplate === value
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* E-commerce & Orders Templates */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  🛒 E-commerce & Orders
                </h3>
                <div className="space-y-1">
                  {Object.entries(EMAIL_TEMPLATE_TYPES)
                    .filter(([key, value]) => 
                      value.includes('order') || 
                      value.includes('payment')
                    )
                    .map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleTemplateChange(value)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedTemplate === value
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact & Support Templates */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  📧 Contact & Support
                </h3>
                <div className="space-y-1">
                  {Object.entries(EMAIL_TEMPLATE_TYPES)
                    .filter(([key, value]) => 
                      value.includes('contact')
                    )
                    .map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleTemplateChange(value)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedTemplate === value
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Data</h3>
                <div className="space-y-4">
                  {getTemplateFields().map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={templateData[field.key] || ''}
                          onChange={(e) => handleDataChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={templateData[field.key] || ''}
                          onChange={(e) => handleDataChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Template Preview */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Template Preview</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const template = generateSimpleEmailTemplate(selectedTemplate, templateData);
                      navigator.clipboard.writeText(template.html);
                      alert('HTML copied to clipboard!');
                    }}
                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Copy HTML
                  </button>
                  <button
                    onClick={() => {
                      const template = generateSimpleEmailTemplate(selectedTemplate, templateData);
                      const newWindow = window.open();
                      newWindow.document.write(template.html);
                      newWindow.document.close();
                    }}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Open in New Tab
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="ml-2 text-sm text-gray-600">Email Preview</span>
                  </div>
                </div>
                <div className="bg-white p-4">
                  <div 
                    className="email-preview"
                    dangerouslySetInnerHTML={{ __html: getTemplatePreview() }}
                    style={{ 
                      maxHeight: '600px', 
                      overflow: 'auto',
                      // Ensure links are clickable
                      pointerEvents: 'auto'
                    }}
                    onClick={(e) => {
                      // Handle link clicks in the email preview
                      if (e.target.tagName === 'A') {
                        e.preventDefault();
                        const href = e.target.getAttribute('href');
                        if (href) {
                          if (href.startsWith('mailto:') || href.startsWith('tel:')) {
                            window.location.href = href;
                          } else {
                            window.open(href, '_blank', 'noopener,noreferrer');
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Template Info */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Template Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Template:</strong> {selectedTemplate}</p>
                  <p><strong>Subject:</strong> {generateSimpleEmailTemplate(selectedTemplate, templateData).subject}</p>
                  <p><strong>Type:</strong> {
                    selectedTemplate.includes('verification') ? 'Verification' : 
                    selectedTemplate.includes('welcome') ? 'Welcome' : 
                    selectedTemplate.includes('password') ? 'Password Reset' : 
                    selectedTemplate.includes('contact') ? 'Contact Form' :
                    selectedTemplate.includes('order') ? 'Order' : 
                    'Other'
                  }</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
