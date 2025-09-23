import { signinSchema, validateWithZod } from '../../../lib/zodSchemas';
import { UserService } from '../../../lib/auth/userService.js';
import { createSuccessResponse, createErrorResponse, asyncHandler } from '../../../lib/errorHandler.js';
import config from '../../../lib/config.js';

export default asyncHandler(async (req, res) => {
  if (req.method !== 'POST') {
    return createErrorResponse(res, 405, 'Method not allowed');
  }

  try {
    // Validate request body using Zod
    const validation = validateWithZod(signinSchema, req.body);
    if (!validation.success) {
      return createErrorResponse(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const { email, password, recaptchaToken } = validation.data;

    // Verify reCAPTCHA if provided and enabled
    if (recaptchaToken && config.FEATURES.RECAPTCHA) {
      try {
        const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${config.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
        });

        const recaptchaData = await recaptchaResponse.json();
        
        if (!recaptchaData.success) {
          return createErrorResponse(res, 400, 'reCAPTCHA verification failed', 'VALIDATION_ERROR');
        }
      } catch (recaptchaError) {
        console.error('reCAPTCHA verification error:', recaptchaError);
        return createErrorResponse(res, 400, 'reCAPTCHA verification failed', 'VALIDATION_ERROR');
      }
    }

    // Authenticate user using robust UserService
    const authResult = await UserService.authenticateUser(email, password);
    
    if (!authResult.success) {
      return createErrorResponse(res, 401, authResult.message, authResult.error);
    }

    // Set secure HTTP-only cookie for session management
    const cookieOptions = {
      httpOnly: true,
      secure: config.SECURE_COOKIES,
      sameSite: config.SAME_SITE_COOKIES,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    };

    res.setHeader('Set-Cookie', [
      `authToken=${authResult.accessToken}; ${Object.entries(cookieOptions).map(([key, value]) => `${key}=${value}`).join('; ')}`,
      `refreshToken=${authResult.refreshToken}; ${Object.entries(cookieOptions).map(([key, value]) => `${key}=${value}`).join('; ')}`
    ]);

    return createSuccessResponse(res, {
      user: authResult.user,
      accessToken: authResult.accessToken,
      expiresIn: authResult.expiresIn
    }, 'Authentication successful');

  } catch (error) {
    console.error('🔐 Authentication error:', error);
    return createErrorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});
