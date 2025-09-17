/**
 * Posts API Endpoint
 * 
 * Fetches blog posts from WordPress backend
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { page = 1, per_page = 10, category } = req.query
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local'
    
    // Build query parameters
    let queryParams = `page=${page}&per_page=${per_page}&_embed=true`
    if (category) {
      queryParams += `&categories=${category}`
    }
    
    // Fetch posts from WordPress REST API
    const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/posts?${queryParams}`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`)
    }

    const posts = await response.json()
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1')
    const total = parseInt(response.headers.get('X-WP-Total') || '0')

    // Process posts data
    const processedPosts = posts.map(post => ({
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
    }))

    // Set cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return res.status(200).json({
      success: true,
      data: {
        posts: processedPosts,
        totalPages,
        total,
        currentPage: parseInt(page),
        perPage: parseInt(per_page)
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Posts API error:', error)
    
    return res.status(500).json({
      success: false,
      error: error.message,
      data: {
        posts: [],
        totalPages: 0,
        total: 0,
        currentPage: 1,
        perPage: 10
      },
      timestamp: new Date().toISOString()
    })
  }
}
