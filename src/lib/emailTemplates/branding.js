// Dynamic Email Branding System
// Fetches branding information from WordPress backend and provides fallbacks

/**
 * Fetch site branding information from WordPress backend
 */
export const getSiteBranding = async () => {
  try {
    // Try to fetch from WordPress backend first
    const response = await fetch('/api/site-info');
    const data = await response.json();
    
    if (data.success && data.data) {
      return {
        siteName: data.data.name || 'NextGen Ecommerce',
        siteDescription: data.data.description || 'A modern e-commerce platform',
        siteUrl: data.data.url || process.env.NEXT_PUBLIC_WORDPRESS_URL || '#',
        adminEmail: data.data.admin_email || 'admin@example.com',
        timezone: data.data.timezone || 'UTC',
        dateFormat: data.data.date_format || 'F j, Y',
        timeFormat: data.data.time_format || 'g:i a'
      };
    }
  } catch (error) {
    console.log('Could not fetch site branding from WordPress backend:', error.message);
  }

  // Fallback branding information
  return {
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'NextGen Ecommerce',
    siteDescription: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern e-commerce platform',
    siteUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.NEXT_PUBLIC_SITE_URL || '#',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
    timezone: 'UTC',
    dateFormat: 'F j, Y',
    timeFormat: 'g:i a'
  };
};

/**
 * Fetch contact information for email templates
 */
export const getContactInfo = async () => {
  try {
    // Try to fetch from WordPress backend first
    const response = await fetch('/api/contact/info');
    const data = await response.json();
    
    if (data.success && data.contactInfo) {
      return {
        supportEmail: data.contactInfo.supportEmail || data.contactInfo.email || 'support@example.com',
        salesEmail: data.contactInfo.salesEmail || 'sales@example.com',
        phoneNumber: data.contactInfo.phone || '+1 (555) 123-4567',
        emergencyPhone: data.contactInfo.emergencyPhone || '+1 (555) 911-HELP',
        businessHours: data.contactInfo.businessHours || ['Monday - Friday: 9:00 AM - 6:00 PM'],
        address: data.contactInfo.address || '123 Business Street, Suite 100',
        city: data.contactInfo.city || 'New York',
        state: data.contactInfo.state || 'NY',
        zipCode: data.contactInfo.zipCode || '10001',
        country: data.contactInfo.country || 'United States'
      };
    }
  } catch (error) {
    console.log('Could not fetch contact info from WordPress backend:', error.message);
  }

  // Fallback contact information
  return {
    supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
    salesEmail: process.env.SALES_EMAIL || 'sales@example.com',
    phoneNumber: process.env.PHONE_NUMBER || '+1 (555) 123-4567',
    emergencyPhone: process.env.EMERGENCY_PHONE || '+1 (555) 911-HELP',
    businessHours: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 10:00 AM - 4:00 PM', 'Sunday: Closed'],
    address: '123 Business Street, Suite 100',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States'
  };
};

/**
 * Get theme colors for email templates
 */
export const getThemeColors = async () => {
  try {
    // Try to fetch from WordPress backend first
    const response = await fetch('/api/theme-options');
    const data = await response.json();
    
    if (data.success && data.data) {
      return {
        primaryColor: data.data.primaryColor || '#667eea',
        secondaryColor: data.data.secondaryColor || '#764ba2',
        successColor: data.data.successColor || '#10B981',
        warningColor: data.data.warningColor || '#F59E0B',
        errorColor: data.data.errorColor || '#EF4444',
        infoColor: data.data.infoColor || '#17a2b8',
        backgroundColor: data.data.backgroundColor || '#FFFFFF',
        surfaceColor: data.data.surfaceColor || '#F9FAFB',
        textColor: data.data.textColor || '#333333',
        textSecondaryColor: data.data.textSecondaryColor || '#666666'
      };
    }
  } catch (error) {
    console.log('Could not fetch theme colors from WordPress backend:', error.message);
  }

  // Fallback theme colors
  return {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    infoColor: '#17a2b8',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F9FAFB',
    textColor: '#333333',
    textSecondaryColor: '#666666'
  };
};

/**
 * Get complete branding information for email templates
 */
export const getEmailBranding = async () => {
  const [siteBranding, contactInfo, themeColors] = await Promise.all([
    getSiteBranding(),
    getContactInfo(),
    getThemeColors()
  ]);

  return {
    ...siteBranding,
    ...contactInfo,
    ...themeColors,
    // Additional computed values
    fullAddress: `${contactInfo.address}, ${contactInfo.city}, ${contactInfo.state} ${contactInfo.zipCode}, ${contactInfo.country}`,
    businessHoursText: Array.isArray(contactInfo.businessHours) 
      ? contactInfo.businessHours.join(', ') 
      : contactInfo.businessHours,
    currentYear: new Date().getFullYear(),
    currentDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    currentTime: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: siteBranding.timezone
    })
  };
};

/**
 * Generate CSS styles for email templates with dynamic branding
 */
export const generateEmailStyles = (branding) => {
  return `
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
  `;
};

/**
 * Generate email template with dynamic branding
 */
export const generateBrandedEmailTemplate = async (templateType, data) => {
  const branding = await getEmailBranding();
  
  // Import the template function
  const { emailTemplates } = await import('./templates');
  const template = emailTemplates[templateType];
  
  if (!template) {
    throw new Error(`Email template '${templateType}' not found`);
  }
  
  // Merge branding data with template data
  const templateData = {
    ...branding,
    ...data
  };
  
  // Generate the template
  const templateResult = template(templateData);
  
  // Add dynamic styles
  const styles = generateEmailStyles(branding);
  
  return {
    ...templateResult,
    html: styles + templateResult.html,
    branding: branding
  };
};

