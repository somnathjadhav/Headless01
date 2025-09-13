import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useGlobalTypography } from '../hooks/useGlobalTypography';
import { useSiteInfo } from '../hooks/useSiteInfo';
import GeometricDesign from '../components/ui/GeometricDesign';
import EmailVerificationForm from '../components/auth/EmailVerificationForm';

export default function VerifyEmail() {
  const router = useRouter();
  const { token, code, email } = router.query;
  const { name: siteName, loading: siteLoading } = useSiteInfo();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  // Apply global typography
  useGlobalTypography();

  // Auto-verify if token is provided in URL
  useEffect(() => {
    if (token || code) {
      handleAutoVerification();
    }
  }, [token, code]);

  const handleAutoVerification = async () => {
    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token || null,
          code: code || null
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVerificationResult({
          success: true,
          userData: data.userData
        });
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push('/signin?verified=true');
        }, 3000);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerificationSuccess = (userData) => {
    setVerificationResult({
      success: true,
      userData
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Verification Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Branding */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {siteName || 'NextGen Ecommerce'}
            </h1>
            <p className="text-gray-600">
              Email Verification
            </p>
          </div>

          {/* Verification Content */}
          {isVerifying ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifying Email...</h3>
              <p className="text-gray-600">Please wait while we verify your email address.</p>
            </div>
          ) : verificationResult?.success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Verified Successfully!</h3>
              <p className="text-gray-600 mb-4">
                Welcome to {siteName || 'NextGen Ecommerce'}! Your email has been verified.
              </p>
              <p className="text-sm text-gray-500 mb-6">Redirecting to sign in...</p>
              <Link
                href="/signin?verified=true"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Continue to Sign In
              </Link>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-y-3">
                <Link
                  href="/signin"
                  className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Go to Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          ) : email ? (
            <EmailVerificationForm 
              email={email}
              onVerificationSuccess={handleVerificationSuccess}
            />
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Invalid Verification Link</h3>
              <p className="text-gray-600 mb-4">
                This verification link is invalid or has expired.
              </p>
              <div className="space-y-3">
                <Link
                  href="/signin"
                  className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Go to Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <GeometricDesign />
      </div>
    </div>
  );
}