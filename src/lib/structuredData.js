/**
 * Structured Data Utilities for SEO
 * Generates JSON-LD structured data for different content types
 */

export const generateProductStructuredData = (product) => {
  if (!product) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const productUrl = `${siteUrl}/products/${product.id}`;
  const productImage = product.images?.[0]?.src || `${siteUrl}/placeholder-product.svg`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.short_description?.replace(/<[^>]*>/g, '') || product.description?.replace(/<[^>]*>/g, ''),
    "image": product.images?.map(img => img.src) || [productImage],
    "url": productUrl,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": product.brands?.[0]?.name || "Eternitty"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "INR",
      "availability": product.stock_status === 'instock' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": productUrl,
      "seller": {
        "@type": "Organization",
        "name": "Eternitty Store"
      }
    },
    "aggregateRating": product.average_rating > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.average_rating,
      "reviewCount": product.rating_count
    } : undefined,
    "category": product.categories?.[0]?.name
  };
};

export const generateOrganizationStructuredData = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Eternitty Store",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.svg`,
    "description": "Modern headless WooCommerce store with premium products",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1 (973) 435-3638",
      "contactType": "customer service",
      "email": "info@glozinstore.com"
    },
    "sameAs": [
      "https://facebook.com/eternitty",
      "https://twitter.com/eternitty",
      "https://instagram.com/eternitty"
    ]
  };
};

export const generateBreadcrumbStructuredData = (items) => {
  if (!items || items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.href ? (item.href.startsWith('http') ? item.href : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${item.href}`) : null
    }))
  };
};

export const generateWebsiteStructuredData = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Eternitty Store",
    "url": siteUrl,
    "description": "Modern headless WooCommerce store with premium products",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
};

export const generateCategoryStructuredData = (category, products = []) => {
  if (!category) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description?.replace(/<[^>]*>/g, ''),
    "url": `${siteUrl}/category/${category.slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "url": `${siteUrl}/products/${product.id}`,
          "image": product.images?.[0]?.src,
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "INR"
          }
        }
      }))
    }
  };
};
