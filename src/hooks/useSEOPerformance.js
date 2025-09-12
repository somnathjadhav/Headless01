import { useEffect, useCallback } from 'react'

/**
 * SEO Performance Hook
 * 
 * This hook provides utilities for SEO performance optimization,
 * including preloading, lazy loading, and performance monitoring.
 */
export function useSEOPerformance() {
  
  /**
   * Preload critical resources
   */
  const preloadResource = useCallback((href, as = 'script', crossorigin = false) => {
    if (typeof window === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    
    if (crossorigin) {
      link.crossOrigin = 'anonymous'
    }

    document.head.appendChild(link)
  }, [])

  /**
   * Preload critical images
   */
  const preloadImage = useCallback((src, sizes = '') => {
    if (typeof window === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = src
    link.as = 'image'
    
    if (sizes) {
      link.sizes = sizes
    }

    document.head.appendChild(link)
  }, [])

  /**
   * Preload fonts
   */
  const preloadFont = useCallback((href, type = 'font/woff2') => {
    if (typeof window === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = 'font'
    link.type = type
    link.crossOrigin = 'anonymous'

    document.head.appendChild(link)
  }, [])

  /**
   * Lazy load images with intersection observer
   */
  const lazyLoadImages = useCallback(() => {
    if (typeof window === 'undefined') return

    const images = document.querySelectorAll('img[data-src]')
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target
            img.src = img.dataset.src
            img.classList.remove('lazy')
            imageObserver.unobserve(img)
          }
        })
      })

      images.forEach(img => imageObserver.observe(img))
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach(img => {
        img.src = img.dataset.src
        img.classList.remove('lazy')
      })
    }
  }, [])

  /**
   * Monitor Core Web Vitals
   */
  const monitorCoreWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return

    // Monitor Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log('LCP:', lastEntry.startTime)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime)
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Monitor Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        console.log('CLS:', clsValue)
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }
  }, [])

  /**
   * Optimize images for SEO
   */
  const optimizeImages = useCallback(() => {
    if (typeof window === 'undefined') return

    const images = document.querySelectorAll('img')
    images.forEach(img => {
      // Add loading="lazy" for images below the fold
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy')
      }

      // Add alt text if missing
      if (!img.alt && img.src) {
        const filename = img.src.split('/').pop().split('.')[0]
        img.alt = filename.replace(/[-_]/g, ' ')
      }

      // Add width and height attributes for layout stability
      if (!img.width && !img.height) {
        img.addEventListener('load', () => {
          img.setAttribute('width', img.naturalWidth)
          img.setAttribute('height', img.naturalHeight)
        })
      }
    })
  }, [])

  /**
   * Initialize SEO performance optimizations
   */
  const initializeSEOPerformance = useCallback(() => {
    // Preload critical resources
    preloadResource('/logo.svg', 'image')
    
    // Lazy load images
    lazyLoadImages()
    
    // Optimize images
    optimizeImages()
    
    // Monitor performance (only in development)
    if (process.env.NODE_ENV === 'development') {
      monitorCoreWebVitals()
    }
  }, [preloadResource, lazyLoadImages, optimizeImages, monitorCoreWebVitals])

  // Initialize on mount
  useEffect(() => {
    initializeSEOPerformance()
  }, [initializeSEOPerformance])

  return {
    preloadResource,
    preloadImage,
    preloadFont,
    lazyLoadImages,
    optimizeImages,
    monitorCoreWebVitals,
    initializeSEOPerformance
  }
}

export default useSEOPerformance
