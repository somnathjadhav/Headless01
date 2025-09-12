// Email configuration management
export const getEmailConfig = () => {
  const config = {
    // WordPress SMTP (Primary)
    useWordPressSMTP: process.env.USE_WORDPRESS_SMTP === 'true',
    wordpressUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local',
    
    // Direct SMTP (Fallback)
    useDirectSMTP: process.env.USE_DIRECT_SMTP === 'true',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      fromName: process.env.SMTP_FROM_NAME || 'Your Site'
    },
    
    // Development mode
    isDevelopment: process.env.NODE_ENV === 'development',
    logEmails: process.env.LOG_EMAILS === 'true'
  };

  return config;
};

export const shouldUseWordPressSMTP = () => {
  const config = getEmailConfig();
  return config.useWordPressSMTP && config.wordpressUrl;
};

export const shouldUseDirectSMTP = () => {
  const config = getEmailConfig();
  return config.useDirectSMTP && config.smtp.host && config.smtp.auth.user;
};
