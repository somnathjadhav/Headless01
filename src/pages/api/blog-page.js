/**
 * Blog Page API Endpoint
 * 
 * Creates or fetches the blog page from WordPress backend
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local'
    
    // First, try to fetch existing blog page
    const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/pages?slug=blog&_embed=true`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      const pages = await response.json()
      
      if (pages && pages.length > 0) {
        // Blog page exists, return it
        const page = pages[0]
        
        const processedPage = {
          id: page.id,
          title: page.title.rendered,
          slug: page.slug,
          content: page.content.rendered,
          excerpt: page.excerpt.rendered,
          date: page.date,
          modified: page.modified,
          status: page.status,
          featured_media: page.featured_media,
          featured_image: page._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
          author: {
            id: page.author,
            name: page._embedded?.author?.[0]?.name || 'Unknown Author',
            slug: page._embedded?.author?.[0]?.slug || 'unknown'
          },
          link: page.link,
          yoast_head: page.yoast_head || null,
          yoast_head_json: page.yoast_head_json || null
        }

        return res.status(200).json({
          success: true,
          data: processedPage,
          source: 'wordpress'
        })
      }
    }

    // Blog page doesn't exist, return a default blog page structure
    const defaultBlogPage = {
      id: 'blog-default',
      title: 'Blog',
      slug: 'blog',
      content: `
        <div class="blog-intro">
          <h2>Welcome to Our Blog</h2>
          <p>Discover the latest fashion trends, style tips, and lifestyle advice from our expert team. Stay updated with fashion and culture insights.</p>
        </div>
        
        <div class="blog-features">
          <h3>What You'll Find Here</h3>
          <ul>
            <li>Latest fashion trends and style tips</li>
            <li>Lifestyle and culture insights</li>
            <li>Expert advice from our team</li>
            <li>Behind-the-scenes content</li>
          </ul>
        </div>
      `,
      excerpt: 'Welcome to our blog! Here you can find the latest fashion trends, style tips, and lifestyle advice from our expert team.',
      date: new Date().toISOString(),
      modified: new Date().toISOString(),
      status: 'publish',
      featured_media: null,
      featured_image: null,
      author: {
        id: 1,
        name: 'Admin',
        slug: 'admin'
      },
      link: '/blog',
      yoast_head: null,
      yoast_head_json: null
    }

    return res.status(200).json({
      success: true,
      data: defaultBlogPage,
      source: 'default'
    })

  } catch (error) {
    console.error('Error fetching blog page:', error)
    
    // Return default blog page on error
    const defaultBlogPage = {
      id: 'blog-default',
      title: 'Blog',
      slug: 'blog',
      content: `
        <div class="blog-intro">
          <h2>Welcome to Our Blog</h2>
          <p>Discover the latest fashion trends, style tips, and lifestyle advice from our expert team. Stay updated with fashion and culture insights.</p>
        </div>
        
        <div class="blog-features">
          <h3>What You'll Find Here</h3>
          <ul>
            <li>Latest fashion trends and style tips</li>
            <li>Lifestyle and culture insights</li>
            <li>Expert advice from our team</li>
            <li>Behind-the-scenes content</li>
          </ul>
        </div>
      `,
      excerpt: 'Welcome to our blog! Here you can find the latest fashion trends, style tips, and lifestyle advice from our expert team.',
      date: new Date().toISOString(),
      modified: new Date().toISOString(),
      status: 'publish',
      featured_media: null,
      featured_image: null,
      author: {
        id: 1,
        name: 'Admin',
        slug: 'admin'
      },
      link: '/blog',
      yoast_head: null,
      yoast_head_json: null
    }

    return res.status(200).json({
      success: true,
      data: defaultBlogPage,
      source: 'fallback'
    })
  }
}
