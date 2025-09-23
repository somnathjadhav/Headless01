import { verifyToken, extractTokenFromHeader } from './jwt.js';
import { createErrorResponse } from '../errorHandler.js';

/**
 * Authentication middleware factory
 * @param {Object} options - Middleware options
 * @param {boolean} options.required - Whether authentication is required
 * @param {Array} options.roles - Required roles for access
 * @param {boolean} options.adminOnly - Whether admin access is required
 * @returns {Function} Express middleware function
 */
export function createAuthMiddleware(options = {}) {
  const { required = true, roles = [], adminOnly = false } = options;

  return async (req, res, next) => {
    try {
      // Skip authentication if not required
      if (!required) {
        req.user = null;
        return next();
      }

      // Extract token from Authorization header or cookies
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader) || req.cookies?.authToken;

      if (!token) {
        return createErrorResponse(res, 401, 'Authentication required', 'No token provided');
      }

      // Verify token
      const decoded = verifyToken(token);
      
      // Check if user is active
      if (!decoded.userId || !decoded.email) {
        return createErrorResponse(res, 401, 'Invalid token', 'Token missing required fields');
      }

      // Check admin access if required
      if (adminOnly && !decoded.isAdmin) {
        return createErrorResponse(res, 403, 'Admin access required', 'Insufficient privileges');
      }

      // Check roles if specified
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return createErrorResponse(res, 403, 'Insufficient permissions', 'Role not authorized');
      }

      // Add user info to request
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role,
        isAdmin: decoded.isAdmin,
        name: decoded.name
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (error.message === 'Token expired') {
        return createErrorResponse(res, 401, 'Token expired', 'Please sign in again');
      } else if (error.message === 'Invalid token') {
        return createErrorResponse(res, 401, 'Invalid token', 'Please sign in again');
      } else {
        return createErrorResponse(res, 500, 'Authentication error', 'Internal server error');
      }
    }
  };
}

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = createAuthMiddleware({ required: false });

/**
 * Required authentication middleware
 */
export const requireAuth = createAuthMiddleware({ required: true });

/**
 * Admin-only authentication middleware
 */
export const requireAdmin = createAuthMiddleware({ required: true, adminOnly: true });

/**
 * Role-based authentication middleware factory
 * @param {Array} roles - Required roles
 * @returns {Function} Middleware function
 */
export const requireRole = (roles) => createAuthMiddleware({ required: true, roles });

export default {
  createAuthMiddleware,
  optionalAuth,
  requireAuth,
  requireAdmin,
  requireRole
};
