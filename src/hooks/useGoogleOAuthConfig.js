import { useState, useEffect } from 'react';

export function useGoogleOAuthConfig() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clientId, setClientId] = useState(null);
  const [redirectUri, setRedirectUri] = useState(null);

  useEffect(() => {
    const fetchGoogleOAuthConfig = async () => {
      try {
        // Get Google OAuth settings from WordPress backend
        const response = await fetch('/api/google-oauth/config');
        const data = await response.json();
        
        if (data.success && data.data) {
          const oauthConfig = data.data;
          
          // Check if Google OAuth is enabled
          if (oauthConfig.enabled && oauthConfig.client_id && oauthConfig.redirect_uri) {
            setIsEnabled(true);
            setClientId(oauthConfig.client_id);
            setRedirectUri(oauthConfig.redirect_uri);
            console.log('✅ Google OAuth enabled from WordPress backend');
          } else {
            setIsEnabled(false);
            console.log('⚠️ Google OAuth disabled in WordPress backend');
          }
        } else {
          setIsEnabled(false);
          console.log('⚠️ Google OAuth not configured');
        }
      } catch (error) {
        console.error('❌ Error fetching Google OAuth config:', error);
        setIsEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoogleOAuthConfig();
  }, []);

  return { isEnabled, isLoading, clientId, redirectUri };
}
