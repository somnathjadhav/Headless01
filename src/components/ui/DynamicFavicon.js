import { useEffect, useState } from 'react';

export default function DynamicFavicon() {
  const [faviconData, setFaviconData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavicon = async () => {
      try {
        console.log('🔄 Loading favicon from API...');
        const response = await fetch('/api/favicon');
        if (response.ok) {
          const data = await response.json();
          console.log('📡 Favicon API response:', data);
          setFaviconData(data);
          
          // Update document favicon dynamically
          if (data.favicon) {
            console.log('🎯 Updating favicon with:', data.favicon);
            updateFavicon(data.favicon);
          }
        }
      } catch (error) {
        console.error('❌ Error loading favicon:', error);
        // Use fallback favicon
        const fallbackUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL + '/wp-content/uploads/2025/09/logoipsum-370.png';
        console.log('🔄 Using fallback favicon:', fallbackUrl);
        updateFavicon(fallbackUrl);
      } finally {
        setLoading(false);
      }
    };

    loadFavicon();
  }, []);

  const updateFavicon = (faviconUrl) => {
    if (!faviconUrl || typeof document === 'undefined') return;

    try {
      console.log('🔄 Updating favicon to:', faviconUrl);
      
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach(link => {
        console.log('🗑️ Removing favicon link:', link.rel, link.href);
        link.remove();
      });

      // Create new favicon links
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = faviconUrl;
      link.type = 'image/png';
      document.head.appendChild(link);
      console.log('✅ Added favicon link:', link.rel, link.href);

      // Create apple touch icon
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = faviconUrl;
      document.head.appendChild(appleLink);
      console.log('✅ Added apple touch icon:', appleLink.rel, appleLink.href);

      // Create shortcut icon
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.href = faviconUrl;
      document.head.appendChild(shortcutLink);
      console.log('✅ Added shortcut icon:', shortcutLink.rel, shortcutLink.href);
      
      console.log('🎉 Favicon update complete!');
    } catch (error) {
      console.error('❌ Error updating favicon:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
}
