// Simple JWT implementation without external dependencies
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// Simple base64 URL encoding
function base64UrlEncode(str) {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Simple base64 URL decoding
function base64UrlDecode(str) {
  str += '='.repeat((4 - str.length % 4) % 4);
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  return atob(str);
}

// Simple HMAC-SHA256 implementation (for production, use a proper crypto library)
function hmacSha256(data, key) {
  // This is a simplified implementation - in production, use Web Crypto API or a proper crypto library
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const dataData = encoder.encode(data);
  
  // Simple hash function (not cryptographically secure - for demo only)
  let hash = 0;
  for (let i = 0; i < dataData.length; i++) {
    hash = ((hash << 5) - hash + dataData[i]) & 0xffffffff;
  }
  return hash.toString(16);
}

/**
 * Generate JWT token
 * @param {Object} payload - User data to encode
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
export function generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (expiresIn === '7d' ? 7 * 24 * 60 * 60 : 30 * 24 * 60 * 60);
    
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const claims = {
      ...payload,
      iat: now,
      exp: exp,
      iss: 'eternitty-headless-woo',
      aud: 'eternitty-users'
    };
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(claims));
    
    const signature = hmacSha256(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
    const encodedSignature = base64UrlEncode(signature);
    
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  } catch (error) {
    console.error('JWT generation error:', error);
    throw new Error('Token generation failed');
  }
}

/**
 * Generate refresh token
 * @param {Object} payload - User data to encode
 * @returns {string} Refresh token
 */
export function generateRefreshToken(payload) {
  return generateToken(payload, JWT_REFRESH_EXPIRES_IN);
}

// Alias functions for compatibility with existing code
export const generateAccessToken = generateToken;

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // Verify signature
    const expectedSignature = hmacSha256(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
    const actualSignature = base64UrlDecode(encodedSignature);
    
    if (expectedSignature !== actualSignature) {
      throw new Error('Invalid signature');
    }
    
    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    
    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      throw new Error('Token expired');
    }
    
    // Check issuer and audience
    if (payload.iss !== 'eternitty-headless-woo' || payload.aud !== 'eternitty-users') {
      throw new Error('Invalid token claims');
    }
    
    return payload;
  } catch (error) {
    if (error.message === 'Token expired') {
      throw new Error('Token expired');
    } else if (error.message === 'Invalid signature' || error.message === 'Invalid token format') {
      throw new Error('Invalid token');
    } else {
      console.error('JWT verification error:', error);
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
export function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if expired
 */
export function isTokenExpired(token) {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

// Alias for verifyToken
export const verifyAccessToken = verifyToken;

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  extractTokenFromHeader
};
