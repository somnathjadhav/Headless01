/**
 * Lazy Loading Components
 * Code splitting for better performance
 */

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

// Loading component for suspense fallback
const LoadingFallback = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner />
    <span className="ml-2 text-gray-600">{message}</span>
  </div>
);

// Lazy load heavy components
export const LazyProductImageGallery = dynamic(
  () => import('./products/ProductImageGallery'),
  {
    loading: () => <LoadingFallback message="Loading gallery..." />,
    ssr: false // Disable SSR for better performance
  }
);

export const LazyProductTabs = dynamic(
  () => import('./products/ProductTabs'),
  {
    loading: () => <LoadingFallback message="Loading product details..." />,
    ssr: true
  }
);

export const LazyRelatedProducts = dynamic(
  () => import('./products/RelatedProducts'),
  {
    loading: () => <LoadingFallback message="Loading related products..." />,
    ssr: false
  }
);

export const LazyReviewForm = dynamic(
  () => import('./reviews/ReviewForm'),
  {
    loading: () => <LoadingFallback message="Loading review form..." />,
    ssr: false
  }
);

export const LazyQuickPreviewModal = dynamic(
  () => import('./woocommerce/QuickPreviewModal'),
  {
    loading: () => <LoadingFallback message="Loading preview..." />,
    ssr: false
  }
);

export const LazyTypographyShowcase = dynamic(
  () => import('./ui/TypographyShowcase'),
  {
    loading: () => <LoadingFallback message="Loading typography..." />,
    ssr: false
  }
);

export const LazyTypographyColorCard = dynamic(
  () => import('./ui/TypographyColorCard'),
  {
    loading: () => <LoadingFallback message="Loading color palette..." />,
    ssr: false
  }
);

// Lazy load admin components (commented out - components don't exist yet)
// export const LazyAdminPanel = dynamic(
//   () => import('./admin/AdminPanel'),
//   {
//     loading: () => <LoadingFallback message="Loading admin panel..." />,
//     ssr: false
//   }
// );

// Lazy load chart components (commented out - components don't exist yet)
// export const LazyAnalyticsChart = dynamic(
//   () => import('./analytics/AnalyticsChart'),
//   {
//     loading: () => <LoadingFallback message="Loading chart..." />,
//     ssr: false
//   }
// );

// Higher-order component for lazy loading with error boundary
export const withLazyLoading = (Component, fallbackComponent = LoadingFallback) => {
  return function LazyWrapper(props) {
    return (
      <Suspense fallback={<fallbackComponent />}>
        <Component {...props} />
      </Suspense>
    );
  };
};

// Utility for conditional lazy loading
export const conditionalLazyLoad = (condition, Component, fallbackComponent = LoadingFallback) => {
  if (!condition) return null;
  
  return (
    <Suspense fallback={<fallbackComponent />}>
      <Component />
    </Suspense>
  );
};

export default {
  LazyProductImageGallery,
  LazyProductTabs,
  LazyRelatedProducts,
  LazyReviewForm,
  LazyQuickPreviewModal,
  LazyTypographyShowcase,
  LazyTypographyColorCard,
  withLazyLoading,
  conditionalLazyLoad
};
