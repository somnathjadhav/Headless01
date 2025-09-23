import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function EmailVerificationForm({ email, onVerificationSuccess, onBack }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: verificationCode
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        if (onVerificationSuccess) {
          onVerificationSuccess(data.userData);
        }
        // Redirect to signin after 2 seconds
        setTimeout(() => {
          router.push('/signin?verified=true');
        }, 2000);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          useCode: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        setError('');
        // Show success message
        alert('Verification code resent successfully!');
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Verified!</h3>
        <p className="text-gray-600 mb-4">Your email has been successfully verified.</p>
        <p className="text-sm text-gray-500">Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We&apos;ve sent a 6-digit verification code to
        </p>
        <p className="font-semibold text-gray-900">{email}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            id="verificationCode"
            name="verificationCode"
            type="text"
            maxLength="6"
            required
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
            placeholder="000000"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || verificationCode.length !== 6}
          className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Verifying...
            </div>
          ) : (
            'Verify Email'
          )}
        </button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Didn&apos;t receive the code?
        </p>
        <button
          onClick={handleResendCode}
          disabled={isLoading}
          className="text-sm text-purple-600 hover:text-purple-500 font-medium disabled:opacity-50"
        >
          Resend Code
        </button>
      </div>

      {onBack && (
        <div className="text-center">
          <button
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-500"
          >
            ← Back to Sign Up
          </button>
        </div>
      )}
    </div>
  );
}
