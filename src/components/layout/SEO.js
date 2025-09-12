import Head from 'next/head'
import { useSiteInfo } from '../../hooks/useSiteInfo'
import { useYoastSEO } from '../../hooks/useYoastSEORest'
import { memo } from 'react'

const SEO = memo(function SEO({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  canonical,
  noindex = false,
  structuredData,
  keywords,
  // Yoast SEO integration props
  yoastType = null, // 'post', 'page', 'product', 'category', 'tag'
  yoastId = null,   // ID or slug for Yoast lookup
  yoastIdType = 'SLUG', // 'ID', 'SLUG', 'DATABASE_ID'
  useYoast = false, // Enable Yoast integration
  fallbackToManual = true // Fallback to manual props if Yoast fails
}) {
  const siteInfo = useSiteInfo()
  
  // Fetch Yoast SEO data if enabled
  const { 
    seoData: yoastData, 
    loading: yoastLoading, 
    error: yoastError,
    hasYoastData,
    isFallback: yoastIsFallback 
  } = useYoastSEO(yoastType, yoastId, yoastIdType, {
    enabled: useYoast && yoastType && yoastId,
    fallback: fallbackToManual
  })

  // Determine which data to use (Yoast takes priority if available)
  const useYoastData = useYoast && hasYoastData && !yoastError
  
  // Extract data from Yoast or use manual props
  const finalTitle = useYoastData ? yoastData.seo?.title : title
  const finalDescription = useYoastData ? yoastData.seo?.metaDesc : description
  const finalKeywords = useYoastData ? yoastData.seo?.metaKeywords : keywords
  const finalCanonical = useYoastData ? yoastData.seo?.canonical : canonical
  const finalNoindex = useYoastData ? !yoastData.seo?.robots?.index : noindex
  
  // Open Graph data
  const ogTitle = useYoastData ? yoastData.seo?.opengraphTitle : finalTitle
  const ogDescription = useYoastData ? yoastData.seo?.opengraphDescription : finalDescription
  const ogImage = useYoastData ? yoastData.seo?.opengraphImage?.sourceUrl : image
  
  // Twitter data
  const twitterTitle = useYoastData ? yoastData.seo?.twitterTitle : ogTitle
  const twitterDescription = useYoastData ? yoastData.seo?.twitterDescription : ogDescription
  const twitterImage = useYoastData ? yoastData.seo?.twitterImage?.sourceUrl : ogImage
  
  // Featured image fallback
  const featuredImage = useYoastData ? yoastData.featuredImage?.sourceUrl : null
  
  // Site info
  const siteTitle = siteInfo.name || 'NextGen Ecommerce'
  const siteDescription = siteInfo.tagline || siteInfo.description || 'Headless WooCommerce for Next-Gen eCommerce'
  
  // Build final values
  const fullTitle = finalTitle ? `${finalTitle} | ${siteTitle}` : siteTitle
  const fullDescription = finalDescription || siteDescription
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  
  // Image handling with multiple fallbacks
  let finalImage = ogImage || featuredImage || image
  if (finalImage && !finalImage.startsWith('http')) {
    finalImage = `${siteUrl}${finalImage}`
  }
  if (!finalImage) {
    finalImage = `${siteUrl}/logo.svg`
  }
  
  // Handle Yoast full head content
  const yoastFullHead = useYoastData ? yoastData.seo?.fullHead : null
  
  // If Yoast provides full head content, use it (but still allow manual overrides)
  if (yoastFullHead && useYoastData) {
    return (
      <Head>
        {/* Yoast Full Head Content */}
        <div dangerouslySetInnerHTML={{ __html: yoastFullHead }} />
        
        {/* Manual overrides (if provided) */}
        {title && <title>{fullTitle}</title>}
        {description && <meta name="description" content={fullDescription} />}
        {keywords && <meta name="keywords" content={finalKeywords} />}
        {canonical && <link rel="canonical" href={finalCanonical} />}
        
        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3B82F6" />
        
        {/* Structured Data */}
        {structuredData && (
          Array.isArray(structuredData) ? (
            structuredData.map((data, index) => (
              data && (
                <script
                  key={index}
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify(data)
                  }}
                />
              )
            ))
          ) : (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData)
              }}
            />
          )
        )}
      </Head>
    )
  }

  // Standard SEO implementation (manual or Yoast data without full head)
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}
      {finalCanonical && <link rel="canonical" href={finalCanonical} />}
      {finalNoindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || fullDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitle || fullTitle} />
      <meta name="twitter:description" content={twitterDescription || fullDescription} />
      <meta name="twitter:image" content={twitterImage || finalImage} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#3B82F6" />
      
      {/* Yoast Schema Markup */}
      {useYoastData && yoastData.seo?.schema?.raw && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: yoastData.seo.schema.raw
          }}
        />
      )}
      
      {/* Manual Structured Data */}
      {structuredData && (
        Array.isArray(structuredData) ? (
          structuredData.map((data, index) => (
            data && (
              <script
                key={index}
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(data)
                }}
              />
            )
          ))
        ) : (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData)
            }}
          />
        )
      )}
      
      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <meta name="seo-source" content={useYoastData ? 'yoast' : 'manual'} />
          {yoastError && <meta name="yoast-error" content={yoastError} />}
          {yoastIsFallback && <meta name="yoast-fallback" content="true" />}
        </>
      )}
    </Head>
  )
})

export default SEO
