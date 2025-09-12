import { useState, useEffect } from 'react';

export function useRecaptchaConfig() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [siteKey, setSiteKey] = useState(null);
  const [secretKey, setSecretKey] = useState(null);

  useEffect(() => {
    const fetchRecaptchaConfig = async () => {
      try {
        // Get reCAPTCHA settings from dedicated endpoint
        const response = await fetch('/api/recaptcha/config');
        const data = await response.json();
        
        if (data.success && data.data) {
          const recaptchaConfig = data.data;
          
          // Check if reCAPTCHA is enabled
          if (recaptchaConfig.enabled && recaptchaConfig.site_key && recaptchaConfig.secret_key) {
            setIsEnabled(true);
            setSiteKey(recaptchaConfig.site_key);
            setSecretKey(recaptchaConfig.secret_key);
            console.log('✅ reCAPTCHA enabled:', recaptchaConfig.site_key ? 'from WordPress backend' : 'from environment variables');
          } else {
            setIsEnabled(false);
            console.log('⚠️ reCAPTCHA disabled or not configured');
          }
        } else {
          setIsEnabled(false);
          console.log('⚠️ reCAPTCHA not configured');
        }
      } catch (error) {
        console.error('❌ Error fetching reCAPTCHA config:', error);
        setIsEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecaptchaConfig();
  }, []);

  return { isEnabled, isLoading, siteKey, secretKey };
}
