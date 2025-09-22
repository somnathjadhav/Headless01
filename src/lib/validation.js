/**
 * Input Validation and Sanitization Utilities
 * Security-focused validation functions
 */

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Phone number validation (basic)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
};

// Name validation (more flexible for international names)
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 50;
};

// Password strength validation
export const isValidPassword = (password) => {
  if (!password || password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// Password strength scoring and analysis
export const getPasswordStrength = (password) => {
  if (!password) {
    return {
      score: 0,
      level: 'Very Weak',
      checks: {
        length: false,
        lowercase: false,
        uppercase: false,
        numbers: false,
        special: false,
      },
      isValid: false
    };
  }

  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  let score = 0;
  Object.values(checks).forEach(check => {
    if (check) score += 1;
  });

  // Additional points for length
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Determine strength level
  let level;
  if (score <= 2) level = 'Very Weak';
  else if (score <= 3) level = 'Weak';
  else if (score <= 4) level = 'Fair';
  else if (score <= 5) level = 'Good';
  else level = 'Strong';

  return {
    score,
    level,
    checks,
    isValid: isValidPassword(password)
  };
};

// Product ID validation
export const isValidProductId = (id) => {
  return /^\d+$/.test(id) && parseInt(id) > 0;
};

// Slug validation
export const isValidSlug = (slug) => {
  return /^[a-z0-9\-_]+$/.test(slug) && slug.length <= 100;
};

// Price validation
export const isValidPrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice >= 0 && numPrice <= 999999.99;
};

// Quantity validation
export const isValidQuantity = (quantity) => {
  const numQuantity = parseInt(quantity);
  return !isNaN(numQuantity) && numQuantity > 0 && numQuantity <= 999;
};

// HTML sanitization (basic)
export const sanitizeHtml = (html) => {
  if (!html) return '';
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove potentially dangerous attributes
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
};

// Text sanitization (remove HTML tags)
export const sanitizeText = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').trim();
};

// URL validation
export const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Search query sanitization
export const sanitizeSearchQuery = (query) => {
  if (!query) return '';
  
  // Remove HTML tags
  let sanitized = sanitizeText(query);
  
  // Remove special characters that could be used for injection
  sanitized = sanitized.replace(/[<>'"&]/g, '');
  
  // Limit length
  sanitized = sanitized.substring(0, 100);
  
  return sanitized.trim();
};

// API input validation middleware
export const validateApiInput = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field] || req.query[field];
      
      if (rules.required && (!value || value.toString().trim() === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      
      if (value && rules.type) {
        switch (rules.type) {
          case 'email':
            if (!isValidEmail(value)) errors.push(`${field} must be a valid email`);
            break;
          case 'phone':
            if (!isValidPhone(value)) errors.push(`${field} must be a valid phone number`);
            break;
          case 'name':
            if (!isValidName(value)) errors.push(`${field} must be a valid name`);
            break;
          case 'password':
            if (!isValidPassword(value)) errors.push(`${field} must be at least 8 characters with uppercase, lowercase, number, and special character`);
            break;
          case 'productId':
            if (!isValidProductId(value)) errors.push(`${field} must be a valid product ID`);
            break;
          case 'slug':
            if (!isValidSlug(value)) errors.push(`${field} must be a valid slug`);
            break;
          case 'price':
            if (!isValidPrice(value)) errors.push(`${field} must be a valid price`);
            break;
          case 'quantity':
            if (!isValidQuantity(value)) errors.push(`${field} must be a valid quantity`);
            break;
          case 'url':
            if (!isValidUrl(value)) errors.push(`${field} must be a valid URL`);
            break;
        }
      }
      
      if (value && rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      if (value && rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be no more than ${rules.maxLength} characters`);
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    next();
  };
};

// Rate limiting helper
export const createRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [key, timestamp] of requests.entries()) {
      if (timestamp < windowStart) {
        requests.delete(key);
      }
    }
    
    // Check current requests
    const userRequests = Array.from(requests.entries())
      .filter(([key, timestamp]) => key.startsWith(ip) && timestamp > windowStart)
      .length;
    
    if (userRequests >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    requests.set(`${ip}-${now}`, now);
    
    next();
  };
};

