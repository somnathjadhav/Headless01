import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useGlobalTypography } from '../../hooks/useGlobalTypography';
import { useSiteInfo } from '../../hooks/useSiteInfo';
import { useRecaptchaConfig } from '../../hooks/useRecaptchaConfig';
import { 
  UserIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  XMarkIcon,
  GoogleIcon,
  FacebookIcon
} from '../icons';
import SimpleCaptcha from '../ui/SimpleCaptcha';
import PasswordStrengthMeter from '../ui/PasswordStrengthMeter';
import { signinSchema, signupSchema, safeParseWithZod } from '../../lib/zodSchemas';
import { Suspense, lazy } from 'react';

// Lazy load reCAPTCHA component
const LazyGoogleReCaptcha = lazy(() => import('../ui/GoogleReCaptcha'));

export default function AuthModalLight() {
  const router = useRouter();
  const { login, register, isAuthenticated, isLoading, error, clearError } = useAuth();
  const { authModal, closeAuthModal } = useModal();
  const { name: siteName, loading: siteLoading } = useSiteInfo();
  const { isEnabled: isRecaptchaEnabled, isLoading: isRecaptchaLoading } = useRecaptchaConfig();
  
  const [mode, setMode] = useState(authModal.mode); // 'signin', 'signup', or 'forgot-password'
  const [successMessage, setSuccessMessage] = useState('');
  
  // Sign-in form state
  const [signinData, setSigninData] = useState({
    email: '',
    password: ''
  });
  
  // Sign-up form state
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  // Forgot password form state
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  // Apply global typography
  useGlobalTypography();

  // Update mode when authModal.mode changes
  useEffect(() => {
    console.log('AuthModalLight: authModal.mode changed to:', authModal.mode);
    setMode(authModal.mode);
  }, [authModal.mode]);

  // Close modal when authenticated
  useEffect(() => {
    if (isAuthenticated && authModal.isOpen) {
      closeAuthModal();
    }
  }, [isAuthenticated, authModal.isOpen]);

  // Clear errors when modal opens/closes
  useEffect(() => {
    if (authModal.isOpen) {
      setFormErrors({});
      setSuccessMessage('');
      clearError();
    }
  }, [authModal.isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && authModal.isOpen) {
        closeAuthModal();
      }
    };

    if (authModal.isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [authModal.isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let formData, setFormData;
    if (mode === 'signin') {
      formData = signinData;
      setFormData = setSigninData;
    } else if (mode === 'signup') {
      formData = signupData;
      setFormData = setSignupData;
    } else if (mode === 'forgot-password') {
      formData = forgotPasswordData;
      setFormData = setForgotPasswordData;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateSigninForm = () => {
    const result = safeParseWithZod(signinSchema, signinData);
    const errors = result.success ? {} : result.errors;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignupForm = () => {
    const result = safeParseWithZod(signupSchema, signupData);
    const errors = result.success ? {} : result.errors;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSigninSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    clearError();
    
    // Validate form
    const isValid = validateSigninForm();
    if (!isValid) {
      return;
    }
    
    // Check captcha verification (always required)
    if (!captchaVerified) {
      setFormErrors({ captcha: 'Please complete the security check' });
      return;
    }

    const result = await login(signinData.email, signinData.password, recaptchaToken);
    
    if (result.success) {
      closeAuthModal();
    } else {
      // Show login error - let AuthContext handle the error display
      // Don't set formErrors.general to avoid duplicate error messages
      console.error('Login failed:', result.error || result.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    clearError();
    
    // Validate form
    const isValid = validateSignupForm();
    if (!isValid) {
      return;
    }
    
    // Check captcha verification (always required)
    if (!captchaVerified) {
      setFormErrors({ captcha: 'Please complete the security check' });
      return;
    }

    const result = await register(
      signupData.firstName, 
      signupData.lastName, 
      signupData.username,
      signupData.email, 
      signupData.password,
      recaptchaToken
    );
    
    if (result.success) {
      setSuccessMessage('Registration successful! Please sign in to continue.');
      setMode('signin');
      // Clear signup form
      setSignupData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
      });
    } else {
      // Show registration error - let AuthContext handle the error display
      // Don't set formErrors.general to avoid duplicate error messages
      console.error('Registration failed:', result.error || result.message);
    }
  };

  const verifyRecaptcha = (token) => {
    if (token) {
      setCaptchaVerified(true);
      setRecaptchaToken(token);
      if (formErrors.captcha) {
        setFormErrors(prev => ({
          ...prev,
          captcha: ''
        }));
      }
    } else {
      setCaptchaVerified(false);
      setRecaptchaToken(null);
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

  if (!authModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Light Gradient Backdrop */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 transition-opacity duration-300 animate-in fade-in"
        onClick={closeAuthModal}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4">
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white/90 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-300 backdrop-blur-sm border border-gray-200 shadow-lg"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>

          {/* Two Column Layout - 70% Form + 30% Image */}
          <div className="grid grid-cols-10 min-h-[600px]">
            {/* Left Column - Form (70%) */}
            <div className="col-span-7 flex flex-col justify-center p-8">
              {/* Tab Navigation */}
              <div className="flex mb-6 gap-2">
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md border transition-all duration-200 ${
                    mode === 'signup'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300'
                  }`}
                >
                  Sign up
                </button>
                <button
                  onClick={() => setMode('signin')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md border transition-all duration-200 ${
                    mode === 'signin'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300'
                  }`}
                >
                  Sign in
                </button>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {mode === 'signin' ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                {mode === 'signin' 
                  ? 'Sign in to your account to continue' 
                  : 'Join us and start your shopping journey'
                }
              </p>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-global">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message - Show either AuthContext error or form error, but not both */}
              {(error || formErrors.general) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-global">
                  <p className="text-sm text-red-800">{error || formErrors.general}</p>
                </div>
              )}

              {/* Sign In Form */}
              {mode === 'signin' && (
                <form onSubmit={handleSigninSubmit} className="space-y-4">
                  {/* Email/Username Field */}
                  <div className="form-group">
                    <input
                      id="signin-email-light"
                      name="email"
                      type="text"
                      autoComplete="username"
                      required
                      value={signinData.email}
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
                    <div className="input-group">
                      <input
                        id="signin-password-light"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={signinData.password}
                        onChange={handleInputChange}
                        className={`form-input ${formErrors.password ? 'error' : ''}`}
                        placeholder="Enter your password"
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
                  <div className="form-group">
                    {isRecaptchaLoading ? (
                      <div className="h-16 bg-gray-100 rounded-global animate-pulse flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce"></div>
                          <span className="text-sm text-gray-600">Loading security check...</span>
                        </div>
                      </div>
                    ) : false ? (
                      <Suspense fallback={<div className="h-16 bg-gray-100 rounded-global animate-pulse"></div>}>
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
                        darkMode={false}
                      />
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>
              </form>
            )}

              {/* Sign Up Form */}
              {mode === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  {/* Name Fields - Two per row */}
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        id="signup-firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={signupData.firstName}
                        onChange={handleInputChange}
                        className={`form-input ${formErrors.firstName ? 'error' : ''}`}
                        placeholder="First name"
                      />
                      {formErrors.firstName && (
                        <p className="form-error">{formErrors.firstName}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <input
                        id="signup-lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={signupData.lastName}
                        onChange={handleInputChange}
                        className={`form-input ${formErrors.lastName ? 'error' : ''}`}
                        placeholder="Last name"
                      />
                      {formErrors.lastName && (
                        <p className="form-error">{formErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Email and Username - Two per row */}
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        id="signup-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={signupData.email}
                        onChange={handleInputChange}
                        className={`form-input ${formErrors.email ? 'error' : ''}`}
                        placeholder="Enter your email"
                      />
                      {formErrors.email && (
                        <p className="form-error">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <input
                        id="signup-username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={signupData.username}
                        onChange={handleInputChange}
                        className={`form-input ${formErrors.username ? 'error' : ''}`}
                        placeholder="Choose a username"
                      />
                      {formErrors.username && (
                        <p className="form-error">{formErrors.username}</p>
                      )}
                    </div>
                  </div>

                  {/* Password Fields - Two per row */}
                  <div className="form-row">
                    <div className="form-group">
                      <div className="input-group">
                        <input
                          id="signup-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={signupData.password}
                          onChange={handleInputChange}
                          className={`form-input ${formErrors.password ? 'error' : ''}`}
                          placeholder="Create a password"
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

                    <div className="form-group">
                      <div className="input-group">
                        <input
                          id="signup-confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={signupData.confirmPassword}
                          onChange={handleInputChange}
                          className={`form-input ${formErrors.confirmPassword ? 'error' : ''}`}
                          placeholder="Confirm your password"
                        />
                        <div className="input-group-icon">
                          <button
                            type="button"
                            className="hover:bg-gray-50 rounded-global-sm transition-colors p-1"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="form-error">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  <div className="form-group">
                    <PasswordStrengthMeter password={signupData.password} />
                  </div>

                  {/* Terms Agreement */}
                  <div className="form-group">
                    <div className="flex items-center">
                      <input
                        id="signup-agreeToTerms"
                        name="agreeToTerms"
                        type="checkbox"
                        checked={signupData.agreeToTerms}
                        onChange={handleInputChange}
                        className="form-checkbox"
                      />
                      <label htmlFor="signup-agreeToTerms" className="ml-2 text-sm text-gray-700">
                        I agree to the{' '}
                        <a className="text-xs text-purple-600 hover:text-purple-500 underline" href="/legal/terms-conditions" target="_blank" rel="noopener noreferrer">
                          Terms and Conditions
                        </a>{' '}
                        and{' '}
                        <a className="text-xs text-purple-600 hover:text-purple-500 underline" href="/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                    {formErrors.agreeToTerms && (
                      <p className="form-error">{formErrors.agreeToTerms}</p>
                    )}
                  </div>

                  {/* reCAPTCHA */}
                  <div className="form-group">
                    {isRecaptchaLoading ? (
                      <div className="h-16 bg-gray-100 rounded-global animate-pulse flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce"></div>
                          <span className="text-sm text-gray-600">Loading security check...</span>
                        </div>
                      </div>
                    ) : false ? (
                      <Suspense fallback={<div className="h-16 bg-gray-100 rounded-global animate-pulse"></div>}>
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
                        darkMode={false}
                      />
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </button>
              </form>
            )}

            {/* Social Login Section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR CONTINUE WITH</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center py-2 px-4 bg-white text-purple-600 border border-purple-200 rounded-md hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 text-sm font-medium">
                  <GoogleIcon className="h-4 w-4 mr-2" />
                  Google
                </button>
                <button className="flex items-center justify-center py-2 px-4 bg-white text-purple-600 border border-purple-200 rounded-md hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 text-sm font-medium">
                  <FacebookIcon className="h-4 w-4 mr-2" />
                  Facebook
                </button>
              </div>
            </div>

              {/* Terms Footer */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our{' '}
                  <a className="text-xs text-purple-600 hover:text-purple-500 underline" href="/legal/terms-conditions" target="_blank" rel="noopener noreferrer">
                    Terms & Service
                  </a>
                </p>
              </div>
            </div>

            {/* Right Column - Shopping Bag Image (30%) */}
            <div className="col-span-3 relative bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-r-3xl overflow-hidden">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('/shopping bag.webp')`
                }}
              />
              
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 via-pink-500/30 to-red-500/50" />
              
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-4">
                    Fashion Forward
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    Discover the latest trends, exclusive collections, and style inspiration from top designers worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
