/**
 * SEO Configuration and Utilities
 * 
 * This file contains SEO-related configuration, constants, and utility functions
 * for the headless WooCommerce frontend.
 */

// Default SEO configuration
export const SEO_CONFIG = {
  // Site defaults
  siteName: 'NextGen Ecommerce',
  siteDescription: 'Headless WooCommerce for Next-Gen eCommerce',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  
  // Default meta tags
  defaultTitle: 'NextGen Ecommerce - Headless WooCommerce Store',
  defaultDescription: 'Shop premium products with our modern headless WooCommerce store. Fast, secure, and optimized for the best shopping experience.',
  defaultKeywords: 'ecommerce, woocommerce, headless, nextjs, react, online shopping',
  
  // Social media defaults
  socialMedia: {
    twitter: '@nextgenecommerce',
    facebook: 'https://www.facebook.com/nextgenecommerce',
    instagram: 'https://www.instagram.com/nextgenecommerce',
    linkedin: 'https://www.linkedin.com/company/nextgenecommerce',
    youtube: 'https://www.youtube.com/@nextgenecommerce'
  },
  
  // Image defaults
  defaultImage: '/logo.svg',
  defaultImageWidth: 1200,
  defaultImageHeight: 630,
  
  // Cache settings
  cache: {
    enabled: true,
    ttl: 300, // 5 minutes
    keyPrefix: 'seo-'
  },
  
  // Performance settings
  performance: {
    preloadImages: true,
    lazyLoadImages: true,
    optimizeImages: true
  }
}

// SEO utility functions
export const seoUtils = {
  /**
   * Generate canonical URL
   */
  generateCanonical: (path, baseUrl = SEO_CONFIG.siteUrl) => {
    if (!path) return baseUrl
    if (path.startsWith('http')) return path
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  },

  /**
   * Generate full page title
   */
  generateTitle: (title, siteName = SEO_CONFIG.siteName) => {
    if (!title) return siteName
    if (title.includes(siteName)) return title
    return `${title} | ${siteName}`
  },

  /**
   * Generate meta description
   */
  generateDescription: (description, defaultDesc = SEO_CONFIG.defaultDescription) => {
    if (!description) return defaultDesc
    // Truncate to 160 characters for optimal SEO
    return description.length > 160 ? `${description.substring(0, 157)}...` : description
  },

  /**
   * Generate keywords string
   */
  generateKeywords: (keywords, defaultKeywords = SEO_CONFIG.defaultKeywords) => {
    if (!keywords) return defaultKeywords
    if (Array.isArray(keywords)) {
      return [...keywords, defaultKeywords].join(', ')
    }
    return `${keywords}, ${defaultKeywords}`
  },

  /**
   * Generate Open Graph data
   */
  generateOpenGraph: (data) => {
    const {
      title,
      description,
      image,
      url,
      type = 'website',
      siteName = SEO_CONFIG.siteName
    } = data

    return {
      'og:type': type,
      'og:title': title,
      'og:description': description,
      'og:image': image,
      'og:url': url,
      'og:site_name': siteName,
      'og:image:width': SEO_CONFIG.defaultImageWidth,
      'og:image:height': SEO_CONFIG.defaultImageHeight
    }
  },

  /**
   * Generate Twitter Card data
   */
  generateTwitterCard: (data) => {
    const {
      title,
      description,
      image,
      card = 'summary_large_image',
      site = SEO_CONFIG.socialMedia.twitter
    } = data

    return {
      'twitter:card': card,
      'twitter:site': site,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image
    }
  },

  /**
   * Generate structured data for products
   */
  generateProductStructuredData: (product) => {
    if (!product) return null

    const baseUrl = SEO_CONFIG.siteUrl
    const productUrl = `${baseUrl}/products/${product.slug || product.id}`
    const imageUrl = product.images?.[0]?.src || `${baseUrl}${SEO_CONFIG.defaultImage}`

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.short_description || product.description,
      image: imageUrl,
      url: productUrl,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: product.brands?.[0]?.name || 'NextGen Ecommerce'
      },
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency || 'USD',
        availability: product.stock_status === 'instock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: productUrl,
        seller: {
          '@type': 'Organization',
          name: SEO_CONFIG.siteName
        }
      },
      aggregateRating: product.average_rating ? {
        '@type': 'AggregateRating',
        ratingValue: product.average_rating,
        reviewCount: product.rating_count
      } : undefined
    }
  },

  /**
   * Generate breadcrumb structured data
   */
  generateBreadcrumbStructuredData: (breadcrumbs) => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }
  },

  /**
   * Generate organization structured data
   */
  generateOrganizationStructuredData: (siteInfo) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteInfo.name || SEO_CONFIG.siteName,
      description: siteInfo.description || SEO_CONFIG.siteDescription,
      url: siteInfo.url || SEO_CONFIG.siteUrl,
      logo: `${SEO_CONFIG.siteUrl}/logo.svg`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: siteInfo.contact?.phone,
        contactType: 'customer service',
        email: siteInfo.contact?.email
      },
      sameAs: [
        siteInfo.socialMedia?.facebook,
        siteInfo.socialMedia?.twitter,
        siteInfo.socialMedia?.instagram,
        siteInfo.socialMedia?.linkedin,
        siteInfo.socialMedia?.youtube
      ].filter(Boolean)
    }
  },

  /**
   * Validate SEO data
   */
  validateSEOData: (data) => {
    const errors = []
    const warnings = []

    // Check title
    if (!data.title) {
      errors.push('Title is required')
    } else if (data.title.length > 60) {
      warnings.push('Title is longer than 60 characters (may be truncated in search results)')
    }

    // Check description
    if (!data.description) {
      errors.push('Description is required')
    } else if (data.description.length > 160) {
      warnings.push('Description is longer than 160 characters (may be truncated in search results)')
    }

    // Check image
    if (!data.image) {
      warnings.push('No image provided (recommended for social sharing)')
    }

    return { errors, warnings }
  }
}

// Export default configuration
export default SEO_CONFIG
