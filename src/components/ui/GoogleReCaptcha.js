import React, { useRef, useEffect, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRecaptchaConfig } from '../../hooks/useRecaptchaConfig';

export default function GoogleReCaptcha({ onVerify, onExpire, onError, error }) {
  const recaptchaRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { siteKey, isLoading: isConfigLoading } = useRecaptchaConfig();

  useEffect(() => {
    if (siteKey) {
      setIsLoaded(true);
    }
  }, [siteKey]);

  const handleVerify = (token) => {
    if (token) {
      setIsVerified(true);
      onVerify(token);
    } else {
      setIsVerified(false);
      onVerify(null);
    }
  };

  const handleExpire = () => {
    setIsVerified(false);
    onExpire();
  };

  const handleError = (error) => {
    setIsVerified(false);
    onError(error);
  };

  const resetRecaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
      setIsVerified(false);
    }
  };

  // If reCAPTCHA is not configured, don't render anything
  if (!siteKey) {
    return null;
  }

  // If reCAPTCHA config is loading or not loaded yet, show loading state
  if (isConfigLoading || !isLoaded) {
    return (
      <div className="space-y-3">
        <label htmlFor="recaptcha-loading" className="block text-sm font-medium text-gray-700">
          Security Check *
        </label>
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Loading security check...</span>
            </div>
            <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-sm text-gray-500">Loading reCAPTCHA...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label htmlFor="recaptcha-container" className="block text-sm font-medium text-gray-700">
        Security Check *
      </label>
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={siteKey}
            onChange={handleVerify}
            onExpired={handleExpire}
            onErrored={handleError}
            theme="light"
            size="normal"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
