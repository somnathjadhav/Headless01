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
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
            <ShieldCheckIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500">Add an extra layer of security</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isEnabled 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
          
          {isEnabled ? (
            <button
              onClick={handleDisable2FA}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
            >
              Disable 2FA
            </button>
          ) : (
            <button
              onClick={handleEnable2FA}
              className="px-4 py-2 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 text-sm font-medium shadow-lg shadow-black/20 transform hover:scale-105"
            >
              Enable 2FA
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600 text-sm leading-relaxed">
          Protect your account with two-factor authentication using an authenticator app like Google Authenticator or Authy.
        </p>

        {isSettingUp && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <QrCodeIcon className="h-5 w-5 text-blue-600 mr-2" />
              Setup Instructions
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="text-sm text-gray-700">Download an authenticator app:</p>
                  <div className="flex space-x-4 mt-1">
                    <span className="text-xs bg-white px-2 py-1 rounded-lg">Google Authenticator</span>
                    <span className="text-xs bg-white px-2 py-1 rounded-lg">Authy</span>
                    <span className="text-xs bg-white px-2 py-1 rounded-lg">Microsoft Authenticator</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="text-sm text-gray-700">Scan this QR code with your authenticator app:</p>
                  {qrCode && (
                    <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 inline-block">
                      <img src={qrCode} alt="2FA QR Code" className="w-32 h-32" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">Enter the 6-digit code from your app:</p>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      maxLength="6"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                    />
                    <button
                      onClick={handleVerify2FA}
                      disabled={!verificationCode || isVerifying}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
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
  );
};

export default TwoFactorAuth;
