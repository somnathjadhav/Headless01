/**
 * Individual Post API Endpoint
 * 
 * Fetches a single blog post by slug from WordPress backend
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { slug } = req.query
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local'
    
    // Fetch post by slug from WordPress REST API
    const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/posts?slug=${slug}&_embed=true`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`)
    }

    const posts = await response.json()

    if (!posts || posts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
        timestamp: new Date().toISOString()
      })
    }

    const post = posts[0]

    // Process post data
    const processedPost = {
      id: post.id,
      title: post.title.rendered,
      slug: post.slug,
      excerpt: post.excerpt.rendered,
      content: post.content.rendered,
      date: post.date,
      modified: post.modified,
      status: post.status,
      featured_media: post.featured_media,
      featured_image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
      author: {
        id: post.author,
        name: post._embedded?.author?.[0]?.name || 'Unknown Author',
        slug: post._embedded?.author?.[0]?.slug || 'unknown'
      },
      categories: post._embedded?.['wp:term']?.[0] || [],
      tags: post._embedded?.['wp:term']?.[1] || [],
      link: post.link,
      yoast_head: post.yoast_head || null,
      yoast_head_json: post.yoast_head_json || null
    }

    // Set cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return res.status(200).json({
      success: true,
      data: processedPost,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Post API error:', error)
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
