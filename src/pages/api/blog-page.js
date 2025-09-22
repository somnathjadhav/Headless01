import { apiRateLimit } from '../../lib/rateLimiter';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Apply rate limiting
  if (!apiRateLimit(req, res)) {
    return; // Rate limit exceeded, response already sent
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL;

    if (!wordpressUrl) {
      return res.status(500).json({
        success: false,
        message: 'WordPress URL not configured'
      });
    }

    // Try to fetch a specific blog page first, then fallback to site info
    let blogPageData = null;

    try {
      // Try to get a page with slug 'blog' or similar
      const pageResponse = await fetch(
        `${wordpressUrl}/wp-json/wp/v2/pages?slug=blog&_embed=true`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (pageResponse.ok) {
        const pages = await pageResponse.json();
        if (pages.length > 0) {
          const page = pages[0];
          blogPageData = {
            id: page.id,
            title: page.title?.rendered || 'Blog',
            content: page.content?.rendered || '',
            excerpt: page.excerpt?.rendered || '',
            slug: page.slug,
            date: page.date,
            modified: page.modified,
            featured_image: page._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
          };
        }
      }
    } catch (pageError) {
      console.log('No specific blog page found, using default');
    }

    // If no specific blog page found, create default blog page data
    if (!blogPageData) {
      blogPageData = {
        id: 'blog-default',
        title: 'Fashion & Style Blog',
        content: '',
        excerpt: 'Discover the latest fashion trends, style tips, and lifestyle advice from our expert team. Stay updated with fashion and culture insights.',
        slug: 'blog',
        date: new Date().toISOString(),
        modified: new Date().toISOString(),
        featured_image: null,
      };
    }

    return res.status(200).json({
      success: true,
      data: blogPageData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching blog page:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blog page',
      error: error.message,
    });
  }
}