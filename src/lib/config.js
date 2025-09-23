/**
 * Environment Configuration Management
 * Centralized configuration with validation and defaults
 */

/**
 * Validate required environment variables
 * @param {Array} requiredVars - Array of required environment variable names
 * @throws {Error} If required variables are missing
 */
function validateRequiredEnvVars(requiredVars) {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {any} fallback - Fallback value
 * @returns {any} Environment variable value or fallback
 */
function getEnvVar(key, fallback = null) {
  return process.env[key] || fallback;
}

/**
 * Get boolean environment variable
 * @param {string} key - Environment variable key
 * @param {boolean} fallback - Fallback value
 * @returns {boolean} Boolean value
 */
function getBooleanEnvVar(key, fallback = false) {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get number environment variable
 * @param {string} key - Environment variable key
 * @param {number} fallback - Fallback value
 * @returns {number} Number value
 */
function getNumberEnvVar(key, fallback = 0) {
  const value = process.env[key];
  if (value === undefined) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

// Application Configuration
export const config = {
  // Environment
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  IS_DEVELOPMENT: getEnvVar('NODE_ENV') === 'development',
  IS_PRODUCTION: getEnvVar('NODE_ENV') === 'production',
  IS_TEST: getEnvVar('NODE_ENV') === 'test',

  // Application
  APP_NAME: getEnvVar('APP_NAME', 'Eternitty Headless WooCommerce'),
  APP_VERSION: getEnvVar('APP_VERSION', '1.0.0'),
  PORT: getNumberEnvVar('PORT', 3000),
  HOST: getEnvVar('HOST', 'localhost'),

  // URLs
  SITE_URL: getEnvVar('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
  WORDPRESS_URL: getEnvVar('NEXT_PUBLIC_WORDPRESS_URL', 'http://woocommerce.local'),
  API_URL: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:3000/api'),

  // Authentication
  JWT_SECRET: getEnvVar('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  JWT_REFRESH_EXPIRES_IN: getEnvVar('JWT_REFRESH_EXPIRES_IN', '30d'),
  SESSION_SECRET: getEnvVar('SESSION_SECRET', 'your-session-secret-change-in-production'),

  // WordPress
  WORDPRESS_CONSUMER_KEY: getEnvVar('WORDPRESS_CONSUMER_KEY'),
  WORDPRESS_CONSUMER_SECRET: getEnvVar('WORDPRESS_CONSUMER_SECRET'),
  WORDPRESS_WEBHOOK_SECRET: getEnvVar('WORDPRESS_WEBHOOK_SECRET'),

  // WooCommerce
  WOOCOMMERCE_CONSUMER_KEY: getEnvVar('WOOCOMMERCE_CONSUMER_KEY'),
  WOOCOMMERCE_CONSUMER_SECRET: getEnvVar('WOOCOMMERCE_CONSUMER_SECRET'),

  // Email
  SMTP_HOST: getEnvVar('SMTP_HOST'),
  SMTP_PORT: getNumberEnvVar('SMTP_PORT', 587),
  SMTP_SECURE: getBooleanEnvVar('SMTP_SECURE', false),
  SMTP_USER: getEnvVar('SMTP_USER'),
  SMTP_PASS: getEnvVar('SMTP_PASS'),
  SMTP_FROM_EMAIL: getEnvVar('SMTP_FROM_EMAIL'),
  SMTP_FROM_NAME: getEnvVar('SMTP_FROM_NAME', 'Eternitty Store'),

  // reCAPTCHA
  RECAPTCHA_SITE_KEY: getEnvVar('RECAPTCHA_SITE_KEY'),
  RECAPTCHA_SECRET_KEY: getEnvVar('RECAPTCHA_SECRET_KEY'),

  // Google OAuth
  GOOGLE_CLIENT_ID: getEnvVar('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnvVar('GOOGLE_CLIENT_SECRET'),
  GOOGLE_REDIRECT_URI: getEnvVar('GOOGLE_REDIRECT_URI'),

  // Redis (for caching and rate limiting)
  REDIS_URL: getEnvVar('REDIS_URL'),
  REDIS_HOST: getEnvVar('REDIS_HOST', 'localhost'),
  REDIS_PORT: getNumberEnvVar('REDIS_PORT', 6379),
  REDIS_PASSWORD: getEnvVar('REDIS_PASSWORD'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: getNumberEnvVar('RATE_LIMIT_WINDOW_MS', 60000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: getNumberEnvVar('RATE_LIMIT_MAX_REQUESTS', 60),
  RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: getBooleanEnvVar('RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS', false),

  // Caching
  CACHE_TTL: getNumberEnvVar('CACHE_TTL', 300), // 5 minutes
  CACHE_ENABLED: getBooleanEnvVar('CACHE_ENABLED', true),

  // Security
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
  CORS_CREDENTIALS: getBooleanEnvVar('CORS_CREDENTIALS', true),
  SECURE_COOKIES: getBooleanEnvVar('SECURE_COOKIES', false),
  SAME_SITE_COOKIES: getEnvVar('SAME_SITE_COOKIES', 'lax'),

  // Logging
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
  LOG_FILE: getEnvVar('LOG_FILE'),
  SENTRY_DSN: getEnvVar('SENTRY_DSN'),

  // Database (if using external DB)
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  DB_HOST: getEnvVar('DB_HOST'),
  DB_PORT: getNumberEnvVar('DB_PORT', 5432),
  DB_NAME: getEnvVar('DB_NAME'),
  DB_USER: getEnvVar('DB_USER'),
  DB_PASSWORD: getEnvVar('DB_PASSWORD'),

  // File Upload
  UPLOAD_MAX_SIZE: getNumberEnvVar('UPLOAD_MAX_SIZE', 10485760), // 10MB
  UPLOAD_ALLOWED_TYPES: getEnvVar('UPLOAD_ALLOWED_TYPES', 'image/jpeg,image/png,image/gif,image/webp').split(','),

  // Feature Flags
  FEATURES: {
    GOOGLE_OAUTH: getBooleanEnvVar('FEATURE_GOOGLE_OAUTH', true),
    RECAPTCHA: getBooleanEnvVar('FEATURE_RECAPTCHA', true),
    EMAIL_VERIFICATION: getBooleanEnvVar('FEATURE_EMAIL_VERIFICATION', true),
    RATE_LIMITING: getBooleanEnvVar('FEATURE_RATE_LIMITING', true),
    CACHING: getBooleanEnvVar('FEATURE_CACHING', true),
    ANALYTICS: getBooleanEnvVar('FEATURE_ANALYTICS', false),
    DEBUG_MODE: getBooleanEnvVar('FEATURE_DEBUG_MODE', false)
  }
};

/**
 * Validate configuration
 * @throws {Error} If configuration is invalid
 */
export function validateConfig() {
  // Required variables for production
  if (config.IS_PRODUCTION) {
    const requiredProdVars = [
      'JWT_SECRET',
      'SESSION_SECRET'
    ];

    // Only validate if they're not using default values
    const missingProdVars = requiredProdVars.filter(varName => {
      const value = process.env[varName];
      return !value || value.includes('change-in-production');
    });

    if (missingProdVars.length > 0) {
      throw new Error(`Production environment requires secure values for: ${missingProdVars.join(', ')}`);
    }
  }

  // Validate URLs
  try {
    new URL(config.SITE_URL);
    new URL(config.WORDPRESS_URL);
  } catch (error) {
    throw new Error('Invalid URL configuration');
  }

  // Validate JWT secret length
  if (config.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  console.log('✅ Configuration validated successfully');
}

/**
 * Get configuration for specific environment
 * @param {string} env - Environment name
 * @returns {Object} Environment-specific configuration
 */
export function getConfigForEnv(env = config.NODE_ENV) {
  const baseConfig = { ...config };
  
  switch (env) {
    case 'development':
      return {
        ...baseConfig,
        LOG_LEVEL: 'debug',
        CACHE_ENABLED: false,
        SECURE_COOKIES: false
      };
    
    case 'production':
      return {
        ...baseConfig,
        LOG_LEVEL: 'warn',
        CACHE_ENABLED: true,
        SECURE_COOKIES: true,
        SAME_SITE_COOKIES: 'strict'
      };
    
    case 'test':
      return {
        ...baseConfig,
        LOG_LEVEL: 'error',
        CACHE_ENABLED: false,
        RATE_LIMIT_MAX_REQUESTS: 1000
      };
    
    default:
      return baseConfig;
  }
}

// Validate configuration on import
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration validation failed:', error.message);
  if (config.IS_PRODUCTION) {
    process.exit(1);
  }
}

export default config;