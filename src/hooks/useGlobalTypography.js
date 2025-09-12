import { useEffect } from 'react';
import { useTypography } from '../context/TypographyContext';

/**
 * Custom hook to apply typography globally to all elements
 * This ensures that even dynamically created elements get the correct fonts
 */
export const useGlobalTypography = () => {
  const { typography, applyTypographyToCSS } = useTypography();

  useEffect(() => {
    if (typography && typeof document !== 'undefined') {
      // Apply typography to CSS custom properties
      applyTypographyToCSS(typography);
      
      // Check if typography has already been applied to avoid unnecessary DOM manipulation
      const root = document.documentElement;
      const typographyApplied = root.getAttribute('data-typography-applied');
      
      if (!typographyApplied) {
        // Apply to headings specifically
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(element => {
          element.style.fontFamily = `var(--font-primary)`;
          element.style.fontWeight = '600';
        });
        
        // Mark as applied to prevent re-application
        root.setAttribute('data-typography-applied', 'true');
        // console.log('🎨 Global typography applied to all elements');
      }
    }
  }, [typography, applyTypographyToCSS]);

  return { typography };
};
