import { UserService } from '../../../lib/auth/userService.js';
import { createSuccessResponse, createErrorResponse, asyncHandler } from '../../../lib/errorHandler.js';

export default asyncHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return createErrorResponse(res, 405, 'Method not allowed');
  }

  try {
    // Get user ID from headers or query
    const userId = req.headers['x-user-id'] || req.query.userId;
    
    if (!userId) {
      return createErrorResponse(res, 401, 'User ID required', 'AUTHENTICATION_ERROR');
    }

    // Verify user session using robust UserService
    const verifyResult = await UserService.verifyUserSession(parseInt(userId));
    
    if (!verifyResult.success) {
      return createErrorResponse(res, 401, verifyResult.message, verifyResult.error);
    }

    return createSuccessResponse(res, {
      user: verifyResult.user,
      authenticated: true
    }, 'User authenticated');

  } catch (error) {
    console.error('Auth verify error:', error);
    return createErrorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});
