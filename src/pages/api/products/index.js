import { wooCommerceAPI } from '../../../lib/woocommerce';
import { secureErrorHandler, createSuccessResponse, createErrorResponse } from '../../../lib/errorHandler';
import { validateApiInput } from '../../../lib/validation';
import { apiRateLimit } from '../../../lib/rateLimiter';
import { configureSSL } from '../../../lib/sslConfig';
import { cacheManager } from '../../../lib/redis-cache';
import { logger } from '../../../lib/logger';

// Input validation schema
const validationSchema = {
  page: { type: 'quantity', maxLength: 3 },
  per_page: { type: 'quantity', maxLength: 3 },
  search: { maxLength: 100 },
  category: { type: 'slug', maxLength: 50 },
  orderby: { maxLength: 20 },
  order: { maxLength: 4 }
};

async function productsHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Apply rate limiting with more generous limits for development
  const isDevelopment = process.env.NODE_ENV === 'development';
  const rateLimit = isDevelopment ? 60 : 10; // 60 requests per minute in dev, 10 in production
  const rateWindow = 60000; // 1 minute
  
  if (!apiRateLimit(req, res, rateLimit, rateWindow)) {
    return; // Rate limit exceeded, response already sent
  }

  // Configure SSL based on environment
  const sslConfig = configureSSL(process.env.NEXT_PUBLIC_WORDPRESS_URL);

  try {
    const {
      page = 1,
      per_page = 12,
      search = '',
      category = '',
      orderby = 'date',
      order = 'desc',
      min_price = '',
      max_price = '',
      on_sale = '',
      featured = ''
    } = req.query;

    // Build query parameters
    const params = {
      page: parseInt(page),
      per_page: parseInt(per_page),
      orderby,
      order
    };

    // Add search parameter if provided
    if (search) {
      params.search = search;
    }

    // Add category parameter if provided
    if (category) {
      params.category = category;
    }

    // Add price range parameters if provided
    if (min_price) {
      params.min_price = min_price;
    }
    if (max_price) {
      params.max_price = max_price;
    }

    // Add on_sale parameter if provided
    if (on_sale === 'true') {
      params.on_sale = true;
    }

    // Add featured parameter if provided
    if (featured === 'true') {
      params.featured = true;
    }

    logger.api('GET', '/api/products', 'FETCHING', params);

    // Generate cache key
    const cacheKey = `products:${JSON.stringify(params)}`;
    
    // Try to get from cache first
    let response = await cacheManager.get(cacheKey);
    
    if (!response) {
      // Fetch products from WooCommerce
      response = await wooCommerceAPI.getProducts(params);
      
      // Cache for 5 minutes
      await cacheManager.set(cacheKey, response, 300);
      
      logger.api('GET', '/api/products', 'CACHE_MISS', {
        count: response.products?.length || 0,
        total: response.total,
        totalPages: response.totalPages
      });
    } else {
      logger.api('GET', '/api/products', 'CACHE_HIT', {
        count: response.products?.length || 0,
        total: response.total,
        totalPages: response.totalPages
      });
    }

    // Return products with pagination headers
    res.status(200).json({
      products: response.products || [],
      total: response.total || 0,
      totalPages: response.totalPages || 1,
      currentPage: parseInt(page),
      perPage: parseInt(per_page)
    });

  } catch (error) {
    const { statusCode, response } = createErrorResponse(error, {
      method: req.method,
      url: req.url,
      query: req.query,
    });
    
    return res.status(statusCode).json(response);
  }
}

// Export with secure error handling
export default secureErrorHandler(productsHandler);
