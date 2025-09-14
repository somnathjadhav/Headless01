export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ 
      success: false, 
      message: 'Page slug is required' 
    });
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:10008';
    
    console.log(`🔄 Fetching page content for slug: ${slug}`);
    
    // Fetch page by slug from WordPress
    const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/pages?slug=${slug}&_embed`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`📡 Response status for ${slug}:`, response.status);

    if (!response.ok) {
      console.log(`❌ Failed to fetch page ${slug}:`, response.status, response.statusText);
      return res.status(404).json({
        success: false,
        message: 'Page not found',
        slug: slug
      });
    }

    const pages = await response.json();
    
    if (!pages || pages.length === 0) {
      console.log(`❌ No page found with slug: ${slug}`);
      return res.status(404).json({
        success: false,
        message: 'Page not found',
        slug: slug
      });
    }

    const page = pages[0];
    
    // Check if page is published
    if (page.status !== 'publish') {
      console.log(`❌ Page ${slug} is not published (status: ${page.status})`);
      return res.status(404).json({
        success: false,
        message: 'Page not found',
        slug: slug
      });
    }

    // Extract and clean the content
    const pageContent = {
      id: page.id,
      title: page.title.rendered,
      slug: page.slug,
      content: page.content.rendered,
      excerpt: page.excerpt.rendered ? page.excerpt.rendered.replace(/<[^>]*>/g, '') : '',
      modified: page.modified,
      link: page.link,
      status: page.status,
      featured_media: page.featured_media,
      // Add any embedded media if available
      featured_image: page._embedded && page._embedded['wp:featuredmedia'] 
        ? page._embedded['wp:featuredmedia'][0] 
        : null
    };

    console.log(`✅ Successfully fetched page content for: ${slug}`);
    console.log(`📄 Page title: ${pageContent.title}`);
    console.log(`📄 Content length: ${pageContent.content.length} characters`);

    // Set cache headers for dynamic content
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.status(200).json({
      success: true,
      data: pageContent,
      debug: {
        wordpressUrl,
        slug,
        contentLength: pageContent.content.length,
        hasExcerpt: !!pageContent.excerpt,
        hasFeaturedImage: !!pageContent.featured_image
      }
    });

  } catch (error) {
    console.error(`❌ Error fetching page content for ${slug}:`, error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch page content',
      slug: slug,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
