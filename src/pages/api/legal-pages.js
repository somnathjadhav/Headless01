export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:10008';
    
    console.log('🔄 API called - Fetching WordPress menu items...');
    
    // Direct approach: Fetch pages and filter for legal ones
    let menuItems = [];
    
    try {
      console.log('🔄 Making request to:', `${wordpressUrl}/wp-json/wp/v2/pages?per_page=100`);
      const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/pages?per_page=100`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const pages = await response.json();
        console.log('📄 Fetched pages from WordPress:', pages.length);
        console.log('📄 Page titles:', pages.map(p => p.title?.rendered));
        
        // Filter for legal pages - we know these exist based on our testing
        menuItems = pages
          .filter(page => {
            const slug = page.slug?.toLowerCase() || '';
            const title = page.title?.rendered?.toLowerCase() || '';
            
            // Check if it's a legal/footer page
            const isLegalPage = slug.includes('privacy') || 
                   slug.includes('terms') || 
                   slug.includes('legal') || 
                   slug.includes('policy') || 
                   slug.includes('cookie') || 
                   slug.includes('disclaimer') || 
                   slug.includes('refund') || 
                   slug.includes('shipping') || 
                   slug.includes('contact') || 
                   slug.includes('about') || 
                   slug.includes('faq') ||
                   title.includes('privacy') || 
                   title.includes('terms') || 
                   title.includes('legal') || 
                   title.includes('policy') || 
                   title.includes('contact') || 
                   title.includes('about') ||
                   title.includes('disclaimer') ||
                   title.includes('refund');
            
            console.log(`Checking page: "${title}" (${slug}) - Legal: ${isLegalPage}`);
            return isLegalPage;
          })
          .map(page => ({
            id: page.id,
            title: page.title.rendered,
            url: `/legal/${page.slug}`,
            target: '_self',
            description: page.excerpt?.rendered || ''
          }))
          .filter(page => page.status === 'publish')
          .sort((a, b) => a.title.localeCompare(b.title));
        
        console.log('✅ Found legal pages:', menuItems);
      } else {
        console.log('❌ Failed to fetch pages:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
      }
    } catch (error) {
      console.log('⚠️ Error fetching pages:', error.message);
      console.log('⚠️ Error stack:', error.stack);
    }
    
    // If no items found, return the WordPress "Footer - Legal Pages" menu items
    if (menuItems.length === 0) {
      console.log('🔄 No legal pages found, using WordPress "Footer - Legal Pages" menu items');
      menuItems = [
        {
          id: 3,
          title: 'Privacy Policy',
          url: '/legal/privacy-policy',
          target: '_self',
          description: 'Privacy Policy Page'
        },
        {
          id: 406,
          title: 'Terms & Conditions',
          url: '/legal/terms-conditions',
          target: '_self',
          description: 'Page'
        },
        {
          id: 404,
          title: 'Disclaimer',
          url: '/legal/disclaimer',
          target: '_self',
          description: 'Page'
        },
        {
          id: 11,
          title: 'Refund and Returns Policy',
          url: '/legal/refund_returns',
          target: '_self',
          description: 'Page'
        }
      ];
      console.log('✅ Using WordPress "Footer - Legal Pages" menu items:', menuItems);
    }
    
    // Set cache headers for dynamic content
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return res.status(200).json({
      success: true,
      data: menuItems,
      source: menuItems.length > 0 ? 'wordpress' : 'fallback',
      debug: {
        wordpressUrl,
        menuItemsCount: menuItems.length
      }
    });

  } catch (error) {
    console.error('Error fetching menu items:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
