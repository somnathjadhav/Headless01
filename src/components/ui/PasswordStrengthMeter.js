import React from 'react';

const PasswordStrengthMeter = ({ password, show = true, darkMode = false }) => {
  if (!show) return null;

  // Calculate password strength
  const calculateStrength = (password) => {
    const pwd = password || '';
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    // Calculate score based on checks
    Object.values(checks).forEach(check => {
      if (check) score += 1;
    });

    // Additional points for length
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;

    return { score, checks };
  };

  const { score, checks } = calculateStrength(password || '');

  // Determine strength level and colors
  const getStrengthLevel = (score) => {
    if (!password || password.length === 0) {
      return { 
        level: 'Enter password', 
        color: darkMode ? 'bg-white/20' : 'bg-gray-300', 
        textColor: darkMode ? 'text-white/60' : 'text-gray-500' 
      };
    }
    if (score <= 2) return { 
      level: 'Very Weak', 
      color: 'bg-red-500', 
      textColor: darkMode ? 'text-red-300' : 'text-red-600' 
    };
    if (score <= 3) return { 
      level: 'Weak', 
      color: 'bg-orange-500', 
      textColor: darkMode ? 'text-orange-300' : 'text-orange-600' 
    };
    if (score <= 4) return { 
      level: 'Fair', 
      color: 'bg-yellow-500', 
      textColor: darkMode ? 'text-yellow-300' : 'text-yellow-600' 
    };
    if (score <= 5) return { 
      level: 'Good', 
      color: 'bg-blue-500', 
      textColor: darkMode ? 'text-blue-300' : 'text-blue-600' 
    };
    return { 
      level: 'Strong', 
      color: 'bg-green-500', 
      textColor: darkMode ? 'text-green-300' : 'text-green-600' 
    };
  };

  const strengthInfo = getStrengthLevel(score);

  // Calculate progress percentage
  const progressPercentage = Math.min((score / 6) * 100, 100);

  // Helper function for requirement item styling
  const getRequirementStyles = (isValid) => ({
    container: isValid 
      ? (darkMode ? 'bg-green-500/20' : 'bg-green-100')
      : (darkMode ? 'bg-white/10' : 'bg-gray-100'),
    icon: isValid 
      ? (darkMode ? 'text-green-300' : 'text-green-600')
      : (darkMode ? 'text-white/40' : 'text-gray-400'),
    text: isValid 
      ? (darkMode ? 'text-green-300' : 'text-green-700')
      : (darkMode ? 'text-white/50' : 'text-gray-500')
  });

  return (
    <div className="mt-2 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-sm font-normal ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
            Password Strength
          </span>
          <span className={`text-sm font-normal ${strengthInfo.textColor}`}>
            {strengthInfo.level}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-white/20' : 'bg-gray-200'}`}>
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.color}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        <div className={`text-xs font-normal mb-2 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
          Password Requirements:
        </div>
        <div className="grid grid-cols-2 gap-1">
          {/* Left Column */}
          <div className="space-y-1">
            {[
              { key: 'length', text: 'At least 8 characters' },
              { key: 'lowercase', text: 'One lowercase letter' },
              { key: 'numbers', text: 'One number' }
            ].map(({ key, text }) => {
              const isValid = checks[key];
              const styles = getRequirementStyles(isValid);
              return (
                <div key={key} className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${styles.container}`}>
                    {isValid ? (
                      <svg className={`w-3 h-3 ${styles.icon}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${styles.icon}`} />
                    )}
                  </div>
                  <span className={`text-xs ${styles.text}`}>
                    {text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-1">
            {[
              { key: 'uppercase', text: 'One uppercase letter' },
              { key: 'special', text: 'One special character' }
            ].map(({ key, text }) => {
              const isValid = checks[key];
              const styles = getRequirementStyles(isValid);
              return (
                <div key={key} className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${styles.container}`}>
                    {isValid ? (
                      <svg className={`w-3 h-3 ${styles.icon}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${styles.icon}`} />
                    )}
                  </div>
                  <span className={`text-xs ${styles.text}`}>
                    {text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
