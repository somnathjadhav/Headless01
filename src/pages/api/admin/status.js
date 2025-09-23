import { adminAuthMiddleware } from '../../../lib/adminMiddleware';
import { asyncHandler, createErrorResponse } from '../../../lib/errorHandler';
import { logger } from '../../../lib/logger';

async function adminStatusHandler(req, res) {
  try {
    // Get user info from the authenticated session
    const { userId } = req.adminUser;

    // In a real application, you would fetch user details from database
    // For now, we'll return basic user info
    const userData = {
      id: userId,
      name: 'Administrator',
      email: 'admin@example.com',
      roles: ['administrator']
    };

    return res.status(200).json({
      success: true,
      data: {
        user: userData,
        timestamp: new Date().toISOString(),
        sessionValid: true
      },
      message: 'Admin session is valid'
    });

  } catch (error) {
    logger.error('Error in adminStatusHandler:', error);
    return createErrorResponse(res, 500, 'Internal server error', error.message);
  }
}

export default asyncHandler(adminAuthMiddleware(adminStatusHandler));
