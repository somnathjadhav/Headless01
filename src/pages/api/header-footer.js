export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:10008';
    
    // Fetch header/footer settings from WordPress backend
    let headerFooterData = null;
    
    try {
      const response = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/header-footer`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        headerFooterData = await response.json();
        console.log('✅ Found header/footer data from WordPress:', headerFooterData);
      }
    } catch (error) {
      console.log('⚠️ Could not fetch header/footer data:', error.message);
    }
    
    if (!headerFooterData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Header/Footer data not found' 
      });
    }

    // Get media URLs for logos and favicon
    const lightLogoUrl = headerFooterData.lightLogo 
      ? await getMediaUrl(wordpressUrl, headerFooterData.lightLogo)
      : null;
    
    const darkLogoUrl = headerFooterData.darkLogo 
      ? await getMediaUrl(wordpressUrl, headerFooterData.darkLogo)
      : null;
    
    const faviconUrl = headerFooterData.favicon 
      ? await getMediaUrl(wordpressUrl, headerFooterData.favicon)
      : null;

    const response = {
      success: true,
      data: {
        lightLogo: lightLogoUrl,
        darkLogo: darkLogoUrl,
        favicon: faviconUrl,
        topHeaderText: headerFooterData.topHeaderText,
        headerCtaText: headerFooterData.headerCtaText,
        headerCtaLink: headerFooterData.headerCtaLink,
        footerContent: headerFooterData.footerContent,
        footerCopyrightText: headerFooterData.footerCopyrightText,
        useWidgets: headerFooterData.useWidgets
      }
    };

    // Set cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching header/footer data:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch header/footer data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function to get media URL from WordPress media ID
async function getMediaUrl(wordpressUrl, mediaId) {
  try {
    const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/media/${mediaId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const mediaData = await response.json();
      return mediaData?.source_url || null;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching media ${mediaId}:`, error);
    return null;
  }
}
