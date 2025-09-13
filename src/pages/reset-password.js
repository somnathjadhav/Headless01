import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useGlobalTypography } from '../hooks/useGlobalTypography';
import { useSiteInfo } from '../hooks/useSiteInfo';
import { useNotifications } from '../context/NotificationContext';
import GeometricDesign from '../components/ui/GeometricDesign';
import PasswordStrengthMeter from '../components/ui/PasswordStrengthMeter';
import { 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '../components/icons';

export default function ResetPassword() {
  const router = useRouter();
  const { token, email } = router.query;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { name: siteName, loading: siteLoading } = useSiteInfo();
  const { showSuccess, showError, showInfo } = useNotifications();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(null);

  // Apply global typography
  useGlobalTypography();

  // Check if user is already logged in
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (isAuthenticated && user) {
      // User is already logged in, redirect to account page
      showInfo('You are already logged in. You can change your password in your account settings.');
      router.push('/account?tab=security');
      return;
    }
  }, [isAuthenticated, user, authLoading, router, showInfo]);

  // Validate token on component mount
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (token && email) {
      validateToken();
    } else {
      setError('Invalid or missing reset token. Please request a new password reset.');
      setIsValidToken(false);
    }
  }, [token, email, authLoading]);

  const validateToken = async () => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
        setError(data.error || 'Invalid or expired reset token. Please request a new password reset.');
      }
    } catch (err) {
      setIsValidToken(false);
      setError('Failed to validate reset token. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    console.log('Validating form with data:', formData); // Debug log
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else {
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumbers = /\d/.test(formData.password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
      
      console.log('Password checks:', { hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar }); // Debug log
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        errors.password = 'Password must contain uppercase, lowercase, number, and special character';
      }
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    console.log('Validation result:', errors); // Debug log
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setError('');
    setMessage('');
    
    console.log('Form data:', formData); // Debug log
    const errors = validateForm();
    console.log('Validation errors:', errors); // Debug log
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      console.log('Form errors set:', errors); // Debug log
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          email, 
          password: formData.password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const successMessage = data.message || 'Password has been reset successfully. You can now sign in with your new password.';
        setMessage(successMessage);
        showSuccess(successMessage);
        console.log('Password reset successful!');
        
        // Redirect to signin page after 3 seconds
        setTimeout(() => {
          router.push('/signin?message=Password reset successful. Please sign in with your new password.');
        }, 3000);
      } else {
        const errorMessage = data.error || 'Failed to reset password. Please try again.';
        setError(errorMessage);
        showError(errorMessage);
        console.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An error occurred. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while auth is loading or validating token
  if (authLoading || isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Loading...' : 'Validating reset token...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Error Message */}
        <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Invalid Reset Link
              </h1>
              <p className="text-gray-600 mb-8">
                {error}
              </p>
              <div className="space-y-4">
                <Link
                  href="/forgot-password"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Request New Reset Link
                </Link>
                <Link
                  href="/signin"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Geometric Design */}
        <div className="hidden lg:block lg:w-1/2">
          <GeometricDesign />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Reset Password Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Branding */}
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600">
              Create a new password for your {siteLoading ? 'Your WordPress Site' : siteName} account.
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Debug Section - Development Only */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-xs">
              <h4 className="font-bold mb-2">Debug Info:</h4>
              <p>Form Data: {JSON.stringify(formData)}</p>
              <p>Form Errors: {JSON.stringify(formErrors)}</p>
              <p>Is Loading: {isLoading.toString()}</p>
              <p>Error: {error || 'none'}</p>
              <p>Message: {message || 'none'}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
              {/* Debug: Show formErrors state */}
              {process.env.NODE_ENV === 'development' && (
                <p className="mt-1 text-xs text-gray-500">Debug: formErrors.password = {formErrors.password || 'null'}</p>
              )}
              <PasswordStrengthMeter password={formData.password} />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                    formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
              {/* Debug: Show formErrors state */}
              {process.env.NODE_ENV === 'development' && (
                <p className="mt-1 text-xs text-gray-500">Debug: formErrors.confirmPassword = {formErrors.confirmPassword || 'null'}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>

            {/* Back to Sign In */}
            <div className="text-center">
              <Link
                href="/signin"
                className="text-sm text-purple-600 hover:text-purple-500 font-medium"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Geometric Design */}
      <div className="hidden lg:block lg:w-1/2">
        <GeometricDesign />
      </div>
    </div>
  );
}
