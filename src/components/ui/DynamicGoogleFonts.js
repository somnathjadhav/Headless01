import { useEffect, useState } from 'react';
import { useTypography } from '../../context/TypographyContext';

/**
 * Dynamic Google Fonts Loader
 * Loads Google Fonts based on WordPress typography settings
 */
export default function DynamicGoogleFonts() {
  const { typography } = useTypography();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (!typography || !typography.fonts) return;

    const loadGoogleFonts = async () => {
      try {
        // Extract font families from typography settings
        const fontFamilies = [];
        
        if (typography.fonts.primary?.family) {
          fontFamilies.push(typography.fonts.primary.family);
        }
        if (typography.fonts.secondary?.family) {
          fontFamilies.push(typography.fonts.secondary.family);
        }
        if (typography.fonts.display?.family) {
          fontFamilies.push(typography.fonts.display.family);
        }

        if (fontFamilies.length === 0) return;

        // Filter out system fonts and fonts that are already loaded
        const googleFonts = fontFamilies.filter(font => {
          const systemFonts = [
            'system-ui', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman',
            'serif', 'sans-serif', 'monospace'
          ];
          return !systemFonts.includes(font);
        });

        if (googleFonts.length === 0) return;

        // Generate Google Fonts URL
        const fontUrl = generateGoogleFontsUrl(googleFonts);
        
        // Check if font link already exists
        const existingLink = document.querySelector(`link[href*="fonts.googleapis.com"]`);
        if (existingLink) {
          existingLink.remove();
        }

        // Create and append new font link
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        link.onload = () => {
          console.log('🎨 Google Fonts loaded:', googleFonts);
          setFontsLoaded(true);
        };
        link.onerror = () => {
          console.error('❌ Failed to load Google Fonts:', googleFonts);
        };

        document.head.appendChild(link);

      } catch (error) {
        console.error('❌ Error loading Google Fonts:', error);
      }
    };

    loadGoogleFonts();
  }, [typography]);

  // Generate Google Fonts URL with weights
  const generateGoogleFontsUrl = (fonts) => {
    const baseUrl = 'https://fonts.googleapis.com/css2';
    const fontParams = fonts.map(font => {
      // Get font weights for specific fonts
      const weights = getFontWeights(font);
      return `family=${encodeURIComponent(font)}:wght@${weights.join(';')}`;
    });
    
    return `${baseUrl}?${fontParams.join('&')}&display=swap`;
  };

  // Get font weights for specific fonts
  const getFontWeights = (fontFamily) => {
    // Try to get weights from typography settings first
    if (typography && typography.fonts) {
      for (const [key, font] of Object.entries(typography.fonts)) {
        if (font.family === fontFamily && font.weights) {
          return font.weights;
        }
      }
    }
    
    // Fallback to predefined weights
    const fontWeights = {
      'Inter': [100, 200, 300, 400, 500, 600, 700, 800, 900],
      'Roboto': [100, 300, 400, 500, 700, 900],
      'Open Sans': [300, 400, 500, 600, 700, 800],
      'Lato': [100, 300, 400, 700, 900],
      'Poppins': [100, 200, 300, 400, 500, 600, 700, 800, 900],
      'Montserrat': [100, 200, 300, 400, 500, 600, 700, 800, 900],
      'Instrument Sans': [400, 500, 600, 700],
      'Nunito Sans': [200, 300, 400, 500, 600, 700, 800, 900],
      'Rubik': [300, 400, 500, 600, 700, 800, 900],
      'Space Mono': [400, 700],
      'JetBrains Mono': [100, 200, 300, 400, 500, 600, 700, 800],
      'default': [300, 400, 500, 600, 700]
    };
    
    return fontWeights[fontFamily] || fontWeights['default'];
  };

  return null; // This component doesn't render anything
}
