import { useState, useEffect } from 'react';

export function useRecaptchaConfig() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [siteKey, setSiteKey] = useState(null);
  const [secretKey, setSecretKey] = useState(null);

  useEffect(() => {
    const fetchRecaptchaConfig = async () => {
      try {
        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        // Get reCAPTCHA settings from dedicated endpoint
        const response = await fetch('/api/recaptcha/config', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'max-age=600' // Cache for 10 minutes
          }
        });
        
        clearTimeout(timeoutId);
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
        if (error.name !== 'AbortError') {
          console.error('❌ Error fetching reCAPTCHA config:', error);
        }
        setIsEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Delay the API call to allow page to render first
    const timeoutId = setTimeout(fetchRecaptchaConfig, 200);
    return () => clearTimeout(timeoutId);
  }, []);

  return { isEnabled, isLoading, siteKey, secretKey };
}
