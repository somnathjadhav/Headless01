/**
 * Category API Endpoint
 * 
 * Fetches category information by slug from WordPress backend
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { slug } = req.query
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local'
    
    // Fetch category by slug from WordPress REST API
    const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/categories?slug=${slug}`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`)
    }

    const categories = await response.json()

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        timestamp: new Date().toISOString()
      })
    }

    const category = categories[0]

    // Process category data
    const processedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      count: category.count,
      link: category.link,
      parent: category.parent,
      taxonomy: category.taxonomy
    }

    // Set cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return res.status(200).json({
      success: true,
      data: processedCategory,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Category API error:', error)
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
