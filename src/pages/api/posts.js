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
    const { page = 1, per_page = 10 } = req.query;
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL;

    if (!wordpressUrl) {
      return res.status(500).json({
        success: false,
        message: 'WordPress URL not configured'
      });
    }

    // Fetch posts from WordPress REST API with retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        response = await fetch(
          `${wordpressUrl}/wp-json/wp/v2/posts?page=${page}&per_page=${per_page}&_embed=true&status=publish`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          break; // Success, exit retry loop
        } else if (response.status === 429 || response.status === 500) {
          // Rate limit or server error, retry after delay
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`WordPress API error ${response.status}, retrying ${retryCount}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Increased delay
            continue;
          }
        }
        
        // If all retries failed, return empty posts instead of throwing error
        console.log(`WordPress API failed after ${maxRetries} retries, returning empty posts`);
        return res.status(200).json({
          success: true,
          data: {
            posts: [],
            totalPages: 0,
            total: 0,
            currentPage: parseInt(page),
            perPage: parseInt(per_page),
          },
          message: 'WordPress API unavailable, returning empty posts'
        });
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw error;
        }
        console.log(`WordPress API error, retrying ${retryCount}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    const posts = await response.json();
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const total = parseInt(response.headers.get('X-WP-Total') || '0');

    // Transform posts to include featured images and clean data
    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title?.rendered || 'Untitled',
      slug: post.slug || 'untitled',
      excerpt: post.excerpt?.rendered || '',
      content: post.content?.rendered || '',
      date: post.date || new Date().toISOString(),
      modified: post.modified || new Date().toISOString(),
      status: post.status || 'publish',
      featured_image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                     post.featured_media_url || 
                     null,
      author: {
        id: post.author || 0,
        name: post._embedded?.author?.[0]?.name || 'Unknown Author',
        slug: post._embedded?.author?.[0]?.slug || 'unknown',
      },
      categories: post._embedded?.['wp:term']?.[0]?.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      })) || [],
      tags: post._embedded?.['wp:term']?.[1]?.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      })) || [],
      link: post.link || `${wordpressUrl}/${post.slug}`,
    }));

    return res.status(200).json({
      success: true,
      data: {
        posts: transformedPosts,
        totalPages,
        total,
        currentPage: parseInt(page),
        perPage: parseInt(per_page),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message,
    });
  }
}
