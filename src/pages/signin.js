import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useGlobalTypography } from '../hooks/useGlobalTypography';
import { useSiteInfo } from '../hooks/useSiteInfo';
import GeometricDesign from '../components/ui/GeometricDesign';
import SimpleCaptcha from '../components/ui/SimpleCaptcha';
import GoogleReCaptcha from '../components/ui/GoogleReCaptcha';
import { useRecaptchaConfig } from '../hooks/useRecaptchaConfig';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
// import { useNotifications } from '../context/NotificationContext';
import { 
  UserIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  GoogleIcon,
  FacebookIcon
} from '../components/icons';

export default function SignIn() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, isInitializing, error, clearError } = useAuth();
  const { name: siteName, loading: siteLoading } = useSiteInfo();
  const { isEnabled: isRecaptchaEnabled, isLoading: isRecaptchaLoading } = useRecaptchaConfig();
  
  // Check for success message from signup
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  // Apply global typography
  useGlobalTypography();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = router.query.redirect || '/account';
      router.push(redirectTo);
    }
  }, [isAuthenticated, router]);

  // Check for success message from signup
  useEffect(() => {
    if (router.query.message) {
      setSuccessMessage(decodeURIComponent(router.query.message));
      // Clear the message from URL
      router.replace('/signin', undefined, { shallow: true });
    }
  }, [router.query.message, router]);

  // Clear error when component unmounts or error changes
  useEffect(() => {
    return () => {
      if (error) {
        clearError();
      }
    };
  }, [error, clearError]);

  // Verify reCAPTCHA token
  const verifyRecaptcha = async (token) => {
    try {
      const response = await fetch('/api/recaptcha/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCaptchaVerified(true);
        setRecaptchaToken(token);
        return true;
      } else {
        setCaptchaVerified(false);
        setRecaptchaToken(null);
        return false;
      }
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      setCaptchaVerified(false);
      setRecaptchaToken(null);
      return false;
    }
  };

  const handleRecaptchaExpire = () => {
    setCaptchaVerified(false);
    setRecaptchaToken(null);
  };

  const handleRecaptchaError = (error) => {
    console.error('reCAPTCHA error:', error);
    setCaptchaVerified(false);
    setRecaptchaToken(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
    
    // Clear field-specific error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email or username is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    clearError();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Check reCAPTCHA only if it's enabled
    if (isRecaptchaEnabled && (!captchaVerified || !recaptchaToken)) {
      setFormErrors({ captcha: 'Please complete the reCAPTCHA verification' });
      return;
    }

    const result = await login(formData.email, formData.password, recaptchaToken);
    
    if (result.success) {
      // Redirect to account page on successful login
      const redirectTo = router.query.redirect || '/account';
      router.push(redirectTo);
    }
  };

  const handleGoogleLoginSuccess = () => {
    // Redirect to account page on successful Google login
    const redirectTo = router.query.redirect || '/account';
    router.push(redirectTo);
  };

  const handleGoogleLoginError = (error) => {
    setFormErrors({ google: error });
  };

  // Show loading state if authentication is being checked or initialized
  if (isLoading || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Branding */}
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to {siteLoading ? 'Your WordPress Site' : siteName}
            </h1>
            <p className="text-gray-600">
              Sign in for exclusive deals and faster checkout.
            </p>
          </div>
          {/* Success Alert */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email or Username *
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email or username"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
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
            </div>

            {/* reCAPTCHA */}
            <div>
              {isRecaptchaLoading ? (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Security Check *
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Loading security check...</span>
                      </div>
                      <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm text-gray-500">Loading...</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isRecaptchaEnabled ? (
                <GoogleReCaptcha 
                  onVerify={verifyRecaptcha}
                  onExpire={handleRecaptchaExpire}
                  onError={handleRecaptchaError}
                  error={formErrors.captcha}
                />
              ) : (
                <SimpleCaptcha 
                  onVerify={verifyRecaptcha}
                  error={formErrors.captcha}
                />
              )}
              {formErrors.captcha && (
                <p className="mt-2 text-sm text-red-600">{formErrors.captcha}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-purple-600 hover:text-purple-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Log In Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  'Log In'
                )}
              </button>
            </div>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or, Login with</span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleLoginButton 
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                >
                  Continue with Google
                </GoogleLoginButton>
                {formErrors.google && (
                  <p className="mt-2 text-sm text-red-600 text-center">{formErrors.google}</p>
                )}
              </div>
            </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Geometric Design */}
      <div className="hidden lg:flex lg:flex-1">
        <GeometricDesign />
      </div>
    </div>
  );
}
