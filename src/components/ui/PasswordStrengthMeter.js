import React from 'react';

const PasswordStrengthMeter = ({ password, show = true }) => {
  if (!show || !password) return null;

  // Calculate password strength
  const calculateStrength = (password) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    // Calculate score based on checks
    Object.values(checks).forEach(check => {
      if (check) score += 1;
    });

    // Additional points for length
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    return { score, checks };
  };

  const { score, checks } = calculateStrength(password);

  // Determine strength level and colors
  const getStrengthLevel = (score) => {
    if (score <= 2) return { level: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-600' };
    if (score <= 3) return { level: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-600' };
    if (score <= 4) return { level: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    if (score <= 5) return { level: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' };
    return { level: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  const strengthInfo = getStrengthLevel(score);

  // Calculate progress percentage
  const progressPercentage = Math.min((score / 6) * 100, 100);

  return (
    <div className="mt-2 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          <span className={`text-sm font-semibold ${strengthInfo.textColor}`}>
            {strengthInfo.level}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.color}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-600 mb-2">Password Requirements:</div>
        <div className="grid grid-cols-1 gap-1">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              checks.length ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {checks.length ? (
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
              )}
            </div>
            <span className={`text-xs ${checks.length ? 'text-green-700' : 'text-gray-500'}`}>
              At least 8 characters
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              checks.lowercase ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {checks.lowercase ? (
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
              )}
            </div>
            <span className={`text-xs ${checks.lowercase ? 'text-green-700' : 'text-gray-500'}`}>
              One lowercase letter
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              checks.uppercase ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {checks.uppercase ? (
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
              )}
            </div>
            <span className={`text-xs ${checks.uppercase ? 'text-green-700' : 'text-gray-500'}`}>
              One uppercase letter
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              checks.numbers ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {checks.numbers ? (
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
              )}
            </div>
            <span className={`text-xs ${checks.numbers ? 'text-green-700' : 'text-gray-500'}`}>
              One number
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              checks.special ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {checks.special ? (
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
              )}
            </div>
            <span className={`text-xs ${checks.special ? 'text-green-700' : 'text-gray-500'}`}>
              One special character
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
