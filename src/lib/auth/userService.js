import { generateToken, generateRefreshToken } from './jwt.js';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL || 'https://woo.local';

/**
 * WordPress User Service
 * Handles user authentication and data retrieval from WordPress
 */
export class UserService {
  /**
   * Authenticate user with WordPress
   * @param {string} username - Username or email
   * @param {string} password - Password
   * @returns {Object} Authentication result
   */
  static async authenticateUser(username, password) {
    try {
      console.log('🔐 Authenticating user:', username);

      // Attempt WordPress login
      const loginResult = await this.attemptWordPressLogin(username, password);
      
      if (!loginResult.success) {
        return {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        };
      }

      // Get user data from WordPress
      const userData = await this.getWordPressUserData(loginResult.userId);
      
      if (!userData) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User data not found'
        };
      }

      // Generate tokens
      const tokenPayload = {
        userId: userData.id,
        email: userData.email,
        username: userData.username,
        name: userData.name,
        role: userData.role,
        isAdmin: userData.isAdmin
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken({ userId: userData.id });

      return {
        success: true,
        user: userData,
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      };

    } catch (error) {
      console.error('User authentication error:', error);
      return {
        success: false,
        error: 'AUTHENTICATION_FAILED',
        message: 'Authentication failed. Please try again.'
      };
    }
  }

  /**
   * Attempt WordPress login
   * @param {string} username - Username or email
   * @param {string} password - Password
   * @returns {Object} Login result
   */
  static async attemptWordPressLogin(username, password) {
    try {
      const loginUrl = `${WORDPRESS_URL}/wp-login.php`;
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          log: username,
          pwd: password,
          'wp-submit': 'Log In',
          'redirect_to': `${WORDPRESS_URL}/wp-admin/`,
          testcookie: '1'
        }),
        redirect: 'manual'
      });

      const cookies = response.headers.get('set-cookie');
      const responseText = await response.text();
      
      // Check for successful login
      const isLoggedIn = cookies && (
        cookies.includes('wordpress_logged_in_') && 
        !responseText.includes('ERROR') &&
        !responseText.includes('Invalid username') &&
        !responseText.includes('incorrect') &&
        !responseText.includes('wrong')
      );

      if (!isLoggedIn) {
        return { success: false };
      }

      // Extract user ID from cookie
      let userId = null;
      if (cookies) {
        const loggedInCookie = cookies.match(/wordpress_logged_in_([^;]+)/);
        if (loggedInCookie) {
          const cookieParts = decodeURIComponent(loggedInCookie[1]).split('%');
          if (cookieParts.length >= 2) {
            userId = parseInt(cookieParts[1]);
          }
        }
      }

      // Fallback: try to get user ID from WordPress API
      if (!userId) {
        userId = await this.getUserIdFromWordPress(username);
      }

      return { success: true, userId };

    } catch (error) {
      console.error('WordPress login error:', error);
      return { success: false };
    }
  }

  /**
   * Get user ID from WordPress API
   * @param {string} username - Username or email
   * @returns {number|null} User ID
   */
  static async getUserIdFromWordPress(username) {
    try {
      const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users?search=${encodeURIComponent(username)}`);
      if (response.ok) {
        const users = await response.json();
        if (users.length > 0) {
          return users[0].id;
        }
      }
    } catch (error) {
      console.error('WordPress API error:', error);
    }
    return null;
  }

  /**
   * Get user data from WordPress
   * @param {number} userId - User ID
   * @returns {Object|null} User data
   */
  static async getWordPressUserData(userId) {
    try {
      const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`);
      
      if (!response.ok) {
        console.error('WordPress user API error:', response.status);
        return null;
      }

      const wpUser = await response.json();
      
      // Determine admin status
      const isAdmin = wpUser.is_super_admin === true || 
                     (wpUser.capabilities && wpUser.capabilities.administrator === true) ||
                     (wpUser.roles && wpUser.roles.includes('administrator'));

      return {
        id: wpUser.id,
        email: wpUser.email || '',
        name: wpUser.name || '',
        first_name: wpUser.first_name || '',
        last_name: wpUser.last_name || '',
        username: wpUser.slug || '',
        role: isAdmin ? 'administrator' : 'customer',
        isAdmin: isAdmin,
        avatar: wpUser.avatar_urls ? wpUser.avatar_urls['96'] : null
      };

    } catch (error) {
      console.error('WordPress user data error:', error);
      return null;
    }
  }

  /**
   * Verify user session
   * @param {number} userId - User ID
   * @returns {Object} Verification result
   */
  static async verifyUserSession(userId) {
    try {
      const userData = await this.getWordPressUserData(userId);
      
      if (!userData) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        };
      }

      return {
        success: true,
        user: userData
      };

    } catch (error) {
      console.error('User verification error:', error);
      return {
        success: false,
        error: 'VERIFICATION_FAILED',
        message: 'User verification failed'
      };
    }
  }
}

export default UserService;
