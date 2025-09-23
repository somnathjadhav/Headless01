import { useState, useEffect, useCallback } from 'react';

/**
 * Temporary REST API version of useYoastSEO until GraphQL plugins are installed
 */
export function useYoastSEO(type, identifier, idType = 'SLUG', options = {}) {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fallbackData, setFallbackData] = useState(null);

  const {
    enabled = true,
    fallback = true,
    cache = true,
    cacheKey = null
  } = options;

  // Generate cache key
  const cacheKeyValue = cacheKey || `yoast-seo-rest-${type}-${identifier}-${idType}`;

  // Fetch SEO data from REST API
  const fetchSEOData = useCallback(async () => {
    if (!enabled || !identifier) {
      setLoading(false);
      return;
    }

    // Check cache first
    if (cache) {
      const cached = sessionStorage.getItem(cacheKeyValue);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setSeoData(parsed);
          setLoading(false);
          return;
        } catch (e) {
          console.warn('Failed to parse cached SEO data:', e);
        }
      }
    }

    setLoading(true);
    setError(null);

    try {
      const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local';
      const endpoint = '';

      // Build REST API endpoints to try (in order of preference)
      let endpoints = [];
      
      if (type === 'product') {
        // Try WordPress REST API first (better Yoast integration)
        endpoints = [
          `${wordpressUrl}/wp-json/wp/v2/product?slug=${identifier}`,
          `${wordpressUrl}/wp-json/wc/v3/products?slug=${identifier}`
        ];
      } else if (type === 'post') {
        endpoints = [`${wordpressUrl}/wp-json/wp/v2/posts?slug=${identifier}`];
      } else if (type === 'page') {
        endpoints = [`${wordpressUrl}/wp-json/wp/v2/pages?slug=${identifier}`];
      } else if (type === 'category') {
        endpoints = [`${wordpressUrl}/wp-json/wp/v2/product_cat?slug=${identifier}`];
      } else if (type === 'tag') {
        endpoints = [`${wordpressUrl}/wp-json/wp/v2/product_tag?slug=${identifier}`];
      }

      if (endpoints.length === 0) {
        throw new Error(`Unsupported content type: ${type}`);
      }

      console.log(`🔍 Fetching Yoast SEO data via REST for ${type}:`, identifier);
      console.log(`🔍 Trying endpoints:`, endpoints);
      
      // Get WooCommerce credentials for authentication
      const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
      const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';
      
      // Build authentication header
      const auth = btoa(`${consumerKey}:${consumerSecret}`);
      
      let response = null;
      let lastError = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying endpoint:`, endpoint);
          
          response = await fetch(endpoint, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Basic ${auth}`,
            },
          });

          if (response.ok) {
            console.log(`✅ Success with endpoint:`, endpoint);
            break;
          } else {
            const errorText = await response.text();
            console.warn(`⚠️ Endpoint failed: ${endpoint} - ${response.status}`, errorText);
            lastError = new Error(`REST API request failed: ${response.status} - ${errorText}`);
            response = null;
          }
        } catch (err) {
          console.warn(`⚠️ Endpoint error: ${endpoint}`, err.message);
          lastError = err;
          response = null;
        }
      }
      
      if (!response) {
        throw lastError || new Error('All endpoints failed');
      }

      const data = await response.json();
      let contentData = null;

      // Handle array response (most REST endpoints return arrays)
      if (Array.isArray(data) && data.length > 0) {
        contentData = data[0];
      } else if (data && !Array.isArray(data)) {
        contentData = data;
      }

      if (contentData) {
        // Extract Yoast SEO data from yoast_head_json (WooCommerce API)
        const yoastData = contentData.yoast_head_json || {};
        
        const yoastTitle = yoastData.title || 
                          contentData.meta?.['_yoast_wpseo_title'] ||
                          contentData.yoast_meta?.yoast_wpseo_title;
        
        const yoastDescription = yoastData.description ||
                                contentData.meta?.['_yoast_wpseo_metadesc'] ||
                                contentData.yoast_meta?.yoast_wpseo_metadesc;

        const yoastKeywords = contentData.meta?.['_yoast_wpseo_focuskw'] ||
                             contentData.yoast_meta?.yoast_wpseo_focuskw;

        // Process and normalize SEO data
        const processedData = {
          // Basic content info
          id: contentData.id,
          title: contentData.title?.rendered || contentData.name || contentData.title,
          slug: contentData.slug,
          excerpt: contentData.excerpt?.rendered || contentData.short_description || contentData.description,
          
          // Featured image
          featuredImage: contentData.featured_media_url || contentData.images?.[0]?.src,
          
          // Yoast SEO data
          seo: {
            title: yoastTitle,
            metaDesc: yoastDescription,
            metaKeywords: yoastKeywords,
            canonical: yoastData.canonical,
            
            // Open Graph
            opengraphTitle: yoastData.og_title,
            opengraphDescription: yoastData.og_description,
            opengraphImage: yoastData.og_image?.[0]?.url,
            
            // Twitter
            twitterTitle: yoastData.twitter_title,
            twitterDescription: yoastData.twitter_description,
            twitterImage: yoastData.twitter_image,
            
            // Full head content
            fullHead: contentData.yoast_head || null,
            
            // Schema markup
            schema: yoastData.schema ? JSON.stringify(yoastData.schema) : null,
            
            // Robots
            robots: {
              index: yoastData.robots?.index === 'index',
              follow: yoastData.robots?.follow === 'follow'
            }
          },
          
          // Metadata
          source: 'yoast-rest-api',
          timestamp: new Date().toISOString()
        };

        setSeoData(processedData);
        
        // Cache the result
        if (cache) {
          sessionStorage.setItem(cacheKeyValue, JSON.stringify(processedData));
        }
        
        console.log('✅ Yoast SEO data fetched successfully via REST:', processedData);
      } else {
        throw new Error(`No ${type} found with identifier: ${identifier}`);
      }

    } catch (err) {
      console.error('❌ Error fetching Yoast SEO data via REST:', err);
      setError(err.message);
      
      // Set fallback data if enabled
      if (fallback) {
        setFallbackData({
          title: identifier,
          seo: {
            title: identifier,
            metaDesc: '',
            metaKeywords: '',
            canonical: '',
            opengraphTitle: identifier,
            opengraphDescription: '',
            opengraphImage: null,
            twitterTitle: identifier,
            twitterDescription: '',
            twitterImage: null,
            breadcrumbs: [],
            schema: null,
            fullHead: '',
            robots: {
              index: true,
              follow: true
            }
          },
          source: 'fallback',
          timestamp: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  }, [enabled, identifier, type, fallback, cache, cacheKeyValue]);

  // Clear cache
  const clearCache = useCallback(() => {
    sessionStorage.removeItem(cacheKeyValue);
    setSeoData(null);
  }, [cacheKeyValue]);

  // Refresh data
  const refresh = useCallback(() => {
    clearCache();
    fetchSEOData();
  }, [clearCache, fetchSEOData]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchSEOData();
  }, [enabled, identifier, type, idType]);

  // Return the current data (Yoast data or fallback)
  const currentData = seoData || fallbackData;

  return {
    // Data
    seoData: currentData,
    loading,
    error,
    
    // Actions
    refresh,
    clearCache,
    
    // Utilities
    hasYoastData: !!seoData,
    isFallback: !!fallbackData && !seoData,
    
    // Raw data access
    rawSeoData: seoData,
    rawFallbackData: fallbackData
  };
}
