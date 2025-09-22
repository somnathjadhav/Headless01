import { createErrorResponse } from './errorHandler';

// Simple in-memory session store (in production, use Redis or database)
const adminSessions = new Map();

export function createAdminSession(userId, sessionToken, expiresAt) {
  adminSessions.set(sessionToken, {
    userId,
    expiresAt,
    createdAt: Date.now()
  });
}

export function validateAdminSession(sessionToken) {
  if (!sessionToken) {
    return { valid: false, error: 'No session token provided' };
  }

  const session = adminSessions.get(sessionToken);
  
  if (!session) {
    return { valid: false, error: 'Invalid session token' };
  }

  if (Date.now() > session.expiresAt) {
    adminSessions.delete(sessionToken);
    return { valid: false, error: 'Session expired' };
  }

  return { valid: true, userId: session.userId };
}

export function destroyAdminSession(sessionToken) {
  if (sessionToken) {
    adminSessions.delete(sessionToken);
  }
}

export function adminAuthMiddleware(handler) {
  return async (req, res) => {
    try {
      const sessionToken = req.headers.authorization?.replace('Bearer ', '') || 
                          req.cookies?.adminSession;

      const validation = validateAdminSession(sessionToken);
      
      if (!validation.valid) {
        return createErrorResponse(res, 401, 'Admin authentication required', validation.error);
      }

      // Add user info to request
      req.adminUser = { userId: validation.userId };
      
      return handler(req, res);
    } catch (error) {
      return createErrorResponse(res, 500, 'Authentication middleware error', error.message);
    }
  };
}

// Cleanup expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (now > session.expiresAt) {
      adminSessions.delete(token);
    }
  }
}, 60 * 60 * 1000); // 1 hour
