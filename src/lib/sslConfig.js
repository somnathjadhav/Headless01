/**
 * SSL Configuration Utility
 * Environment-aware SSL certificate handling
 */

/**
 * Configure SSL settings based on environment
 * @param {string} wordpressUrl - WordPress URL to check
 */
export const configureSSL = (wordpressUrl) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalWordPress = wordpressUrl?.includes('woo.local') || wordpressUrl?.includes('localhost');
  const isProduction = process.env.NODE_ENV === 'production';

  if (isDevelopment && isLocalWordPress) {
    // Local development with self-signed certificates
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.warn('⚠️  SSL verification disabled for local development');
    console.warn('   This is ONLY for local development with self-signed certificates');
    console.warn('   NEVER use this in production!');
    return {
      sslEnabled: false,
      reason: 'local-development',
      warning: 'SSL verification disabled for local development only'
    };
  } else if (isProduction) {
    // Production environment - SSL must be enabled
    // Don't set NODE_TLS_REJECT_UNAUTHORIZED in production
    console.log('✅ SSL verification enabled for production');
    return {
      sslEnabled: true,
      reason: 'production',
      warning: null
    };
  } else {
    // Development with proper SSL certificates
    // Don't set NODE_TLS_REJECT_UNAUTHORIZED for proper SSL
    console.log('✅ SSL verification enabled');
    return {
      sslEnabled: true,
      reason: 'development-with-ssl',
      warning: null
    };
  }
};

/**
 * Validate SSL configuration for production deployment
 */
export const validateProductionSSL = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sslDisabled = process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0';
  
  if (isProduction && sslDisabled) {
    throw new Error('🚨 SECURITY ERROR: SSL verification is disabled in production!');
  }
  
  return true;
};

/**
 * Get SSL configuration status
 */
export const getSSLStatus = () => {
  return {
    nodeEnv: process.env.NODE_ENV,
    sslRejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
    isSSLEnabled: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0',
    wordpressUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL
  };
};

/**
 * Middleware to ensure proper SSL configuration
 */
export const sslMiddleware = (req, res, next) => {
  try {
    validateProductionSSL();
    next();
  } catch (error) {
    console.error('SSL Configuration Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server configuration error',
      error: 'SSL_CONFIG_ERROR'
    });
  }
};

