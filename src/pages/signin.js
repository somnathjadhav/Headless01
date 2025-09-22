import React, { useState, useEffect, Suspense, lazy } from 'react';
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
import PerformanceMonitor from '../components/ui/PerformanceMonitor';
import { signinSchema, safeParseWithZod } from '../lib/zodSchemas';

// Lazy load non-critical components
const LazyGoogleReCaptcha = lazy(() => import('../components/ui/GoogleReCaptcha'));
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

  // Show loading skeleton while initializing
  if (isInitializing || siteLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Performance Monitor - Development Only */}
        <PerformanceMonitor pageName="Sign In" />
      </div>
    );
  }

  // Verify reCAPTCHA token
  const verifyRecaptcha = (token) => {
    console.log('reCAPTCHA verifyRecaptcha called with token:', token ? 'present' : 'null');
    if (token) {
      setCaptchaVerified(true);
      setRecaptchaToken(token);
      console.log('reCAPTCHA verified successfully');
      // Clear any existing captcha errors
      if (formErrors.captcha) {
        setFormErrors(prev => ({
          ...prev,
          captcha: ''
        }));
      }
    } else {
      setCaptchaVerified(false);
      setRecaptchaToken(null);
      console.log('reCAPTCHA verification cleared');
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
    const result = safeParseWithZod(signinSchema, formData);
    const errors = result.success ? {} : result.errors;
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    clearError();
    
    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      return;
    }
    
    // Check reCAPTCHA only if it's enabled
    if (isRecaptchaEnabled && (!captchaVerified || !recaptchaToken)) {
      console.log('reCAPTCHA validation failed:', { isRecaptchaEnabled, captchaVerified, recaptchaToken });
      setFormErrors({ captcha: 'Please complete the reCAPTCHA verification' });
      return;
    }

    const result = await login(formData.email, formData.password, recaptchaToken);
    
    if (result.success) {
      // Redirect to account page on successful login
      const redirectTo = router.query.redirect || '/account';
      router.push(redirectTo);
    } else {
      // Show login error
      setFormErrors({ 
        general: result.error || result.message || 'Login failed. Please check your credentials and try again.' 
      });
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Branding */}
          <div className="text-left mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome to {siteLoading ? 'Your WordPress Site' : siteName}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
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

          {/* General Form Errors */}
          {formErrors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{formErrors.general}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
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
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                placeholder="Enter your email or username"
              />
              {formErrors.email && (
                <p className="form-error">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <div className="input-group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input ${formErrors.password ? 'error' : ''}`}
                  placeholder="Enter password"
                />
                <div className="input-group-icon">
                  <button
                    type="button"
                    className="hover:bg-gray-50 rounded-global-sm transition-colors p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              {formErrors.password && (
                <p className="form-error">{formErrors.password}</p>
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
                <Suspense fallback={<div className="h-20 bg-gray-100 rounded animate-pulse"></div>}>
                  <LazyGoogleReCaptcha 
                    onVerify={verifyRecaptcha}
                    onExpire={handleRecaptchaExpire}
                    onError={handleRecaptchaError}
                    error={formErrors.captcha}
                  />
                </Suspense>
              ) : (
                <SimpleCaptcha 
                  onVerify={verifyRecaptcha}
                  error={formErrors.captcha}
                />
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
                className="btn btn-primary btn-full"
              >
                {isLoading ? 'Signing in...' : 'Log In'}
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
