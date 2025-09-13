import React, { useState } from 'react';
import { ShieldCheckIcon, QrCodeIcon, KeyIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

const TwoFactorAuth = ({ isEnabled = false, onToggle }) => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleEnable2FA = async () => {
    setIsSettingUp(true);
    try {
      // This would call your backend API to generate 2FA setup
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setBackupCodes(data.backupCodes);
      } else {
        throw new Error('Failed to setup 2FA');
      }
    } catch (error) {
      console.error('2FA setup error:', error);
      // Handle error
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode) return;
    
    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: verificationCode,
          backupCodes
        }),
      });

      if (response.ok) {
        onToggle(true);
        setIsSettingUp(false);
        setVerificationCode('');
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      // Handle error
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onToggle(false);
      } else {
        throw new Error('Failed to disable 2FA');
      }
    } catch (error) {
      console.error('2FA disable error:', error);
      // Handle error
    }
  };

  return (
    <div>
      <h3 className="text-base font-medium text-gray-900 mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Two-Factor Authentication
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-xs text-gray-500">Add an extra layer of security</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
            
            {isEnabled ? (
              <button
                onClick={handleDisable2FA}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                onClick={handleEnable2FA}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                Enable 2FA
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 text-xs leading-relaxed">
            Protect your account with two-factor authentication using an authenticator app like Google Authenticator or Authy.
          </p>

        {isSettingUp && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center text-sm">
              <QrCodeIcon className="h-4 w-4 text-blue-600 mr-2" />
              Setup Instructions
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">1</div>
                <div>
                  <p className="text-xs text-gray-700">Download an authenticator app:</p>
                  <div className="flex space-x-2 mt-1">
                    <span className="text-xs bg-white px-2 py-1 rounded border">Google Authenticator</span>
                    <span className="text-xs bg-white px-2 py-1 rounded border">Authy</span>
                    <span className="text-xs bg-white px-2 py-1 rounded border">Microsoft Authenticator</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">2</div>
                <div>
                  <p className="text-xs text-gray-700">Scan this QR code with your authenticator app:</p>
                  {qrCode && (
                    <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 inline-block">
                      <img src={qrCode} alt="2FA QR Code" className="w-24 h-24" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">3</div>
                <div className="flex-1">
                  <p className="text-xs text-gray-700 mb-2">Enter the 6-digit code from your app:</p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      maxLength="6"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm font-mono"
                    />
                    <button
                      onClick={handleVerify2FA}
                      disabled={!verificationCode || isVerifying}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {backupCodes.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <KeyIcon className="h-5 w-5 text-yellow-600 mr-2" />
              Backup Codes
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-white px-3 py-2 rounded-lg border border-gray-200 font-mono text-sm text-center">
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <DevicePhoneMobileIcon className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-900 text-sm">How it works</h5>
              <p className="text-xs text-gray-600 mt-1">
                After enabling 2FA, you'll need to enter a 6-digit code from your authenticator app every time you sign in.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
