import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGoogleOAuthConfig } from '../../hooks/useGoogleOAuthConfig';
import { GoogleIcon } from '../icons';

export default function GoogleLoginButton({ onSuccess, onError, className = '', children }) {
  const [isLoading, setIsLoading] = useState(false);
  const { googleLogin } = useAuth();
  const { isEnabled, isLoading: configLoading } = useGoogleOAuthConfig();

  const handleGoogleLogin = async () => {
    if (!isEnabled) {
      if (onError) onError('Google login is not enabled');
      return;
    }

    setIsLoading(true);

    try {
      // Get Google OAuth URL from backend
      const response = await fetch('/api/google-oauth/url');
      const data = await response.json();

      if (data.success && data.auth_url) {
        // Store state for verification
        if (data.state) {
          sessionStorage.setItem('google_oauth_state', data.state);
        }

        // Redirect to Google OAuth
        window.location.href = data.auth_url;
      } else {
        throw new Error(data.message || 'Failed to get Google OAuth URL');
      }
    } catch (error) {
      console.error('Google login error:', error);
      if (onError) onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OAuth callback (when user returns from Google)
  React.useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        console.error('Google OAuth error:', error);
        if (onError) onError('Google login was cancelled or failed');
        return;
      }

      if (code && state) {
        // Verify state parameter
        const storedState = sessionStorage.getItem('google_oauth_state');
        if (state !== storedState) {
          console.error('Invalid state parameter');
          if (onError) onError('Invalid authentication state');
          return;
        }

        // Clear the stored state
        sessionStorage.removeItem('google_oauth_state');

        try {
          const result = await googleLogin(code, state);
          
          if (result.success) {
            if (onSuccess) onSuccess();
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            if (onError) onError(result.error);
          }
        } catch (error) {
          console.error('Google login callback error:', error);
          if (onError) onError('Failed to complete Google login');
        }
      }
    };

    // Check if this is an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code') && urlParams.get('state')) {
      handleOAuthCallback();
    }
  }, [googleLogin, onSuccess, onError]);

  // Don't render if Google OAuth is not enabled or still loading config
  if (configLoading || !isEnabled) {
    return null;
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
          Connecting...
        </div>
      ) : (
        <div className="flex items-center">
          <GoogleIcon className="w-5 h-5" />
          <span className="ml-2">{children || 'Continue with Google'}</span>
        </div>
      )}
    </button>
  );
}
