import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useGlobalTypography } from '../hooks/useGlobalTypography';
import { useSiteInfo } from '../hooks/useSiteInfo';
import GeometricDesign from '../components/ui/GeometricDesign';
import SimpleCaptcha from '../components/ui/SimpleCaptcha';
import GoogleReCaptcha from '../components/ui/GoogleReCaptcha';
import { useRecaptchaConfig } from '../hooks/useRecaptchaConfig';
import { EnvelopeIcon, ArrowLeftIcon } from '../components/icons';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const router = useRouter();
  const { name: siteName, loading: siteLoading } = useSiteInfo();
  const { isEnabled: isRecaptchaEnabled, isLoading: isRecaptchaLoading } = useRecaptchaConfig();

  // Apply global typography
  useGlobalTypography();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    if (!captchaVerified || !recaptchaToken) {
      setFormErrors({ captcha: 'Please complete the reCAPTCHA verification' });
      return;
    }
    
    if (!email) {
      setFormErrors({ email: 'Email is required' });
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, recaptchaToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password reset instructions have been sent to your email.');
        
        // Send password reset email via SMTP
        try {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'password-reset',
              to: email,
              data: {
                userName: email.split('@')[0], // Use email prefix as username
                resetLink: data.resetLink || `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${data.token}`
              }
            }),
          });
        } catch (emailError) {
          console.error('Failed to send password reset email:', emailError);
        }
      } else {
        setError(data.error || 'Failed to send password reset email. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Forgot Password Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-lg">
          {/* Back to Sign In Link */}
          <div className="mb-8">
            <Link href="/signin" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Sign In
            </Link>
          </div>

          {/* Branding */}
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
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
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
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

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="w-5 h-5 mr-2" />
                    Send Reset Link
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                href="/signin"
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <GeometricDesign />
      </div>
    </div>
  );
}

