import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useGlobalTypography } from '../hooks/useGlobalTypography';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function VerifyEmail() {
  const router = useRouter();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'expired'
  const [message, setMessage] = useState('Verifying your email address...');
  
  // Apply global typography
  useGlobalTypography();

  useEffect(() => {
    const { token, user } = router.query;
    
    if (!token || !user) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token, user);
  }, [router.query]);

  const verifyEmail = async (token, userId) => {
    try {
      const response = await fetch('/api/auth/confirm-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, userId }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully! You can now sign in to your account.');
      } else {
        if (data.error === 'EXPIRED') {
          setStatus('expired');
          setMessage('This verification link has expired. Please request a new verification email.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  };

  const resendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: router.query.user }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('A new verification email has been sent to your email address.');
      } else {
        setMessage('Failed to resend verification email. Please try again.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage('Failed to resend verification email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'verifying' && (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h2>
                <p className="text-gray-600">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <button
                  onClick={() => router.push('/signin')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Sign In Now
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/signin')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Back to Sign In
                  </button>
                  <button
                    onClick={() => router.push('/signup')}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Create New Account
                  </button>
                </div>
              </>
            )}

            {status === 'expired' && (
              <>
                <XCircleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-3">
                  <button
                    onClick={resendVerification}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Resend Verification Email
                  </button>
                  <button
                    onClick={() => router.push('/signin')}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Back to Sign In
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
