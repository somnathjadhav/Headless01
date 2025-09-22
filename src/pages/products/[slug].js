import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useWooCommerce } from '../../context/WooCommerceContext';
import { useWishlistAuth } from '../../hooks/useWishlistAuth';
import SEO from '../../components/layout/SEO';
import { generateProductStructuredData, generateBreadcrumbStructuredData } from '../../lib/structuredData';
import { 
  LazyProductImageGallery, 
  LazyProductTabs, 
  LazyRelatedProducts, 
  LazyReviewForm 
} from '../../components/LazyComponents';
import ProductInfo from '../../components/products/ProductInfo';
import ProductOptions from '../../components/products/ProductOptions';
import Breadcrumb from '../../components/ui/Breadcrumb';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoginPromptModal from '../../components/modals/LoginPromptModal';

export async function getServerSideProps({ params, req }) {
  const { slug } = params;
  
  try {
    // Fetch product data on the server
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;
    
    console.log('🔍 getServerSideProps - fetching from:', `${baseUrl}/api/products/${slug}`);
    const response = await fetch(`${baseUrl}/api/products/${slug}`);
    
    console.log('🔍 getServerSideProps - response status:', response.status);
    
    if (!response.ok) {
      console.log('🔍 getServerSideProps - response not ok, returning notFound');
      return {
        notFound: true,
      };
    }
    
    const product = await response.json();
    console.log('🔍 getServerSideProps - product received:', product.name);
    
    return {
      props: {
        product,
        slug,
      },
    };
  } catch (error) {
    console.error('🔍 getServerSideProps - Error fetching product:', error);
    return {
      notFound: true,
    };
  }
}

export default function ProductDetailPage({ product: initialProduct, slug: initialSlug }) {
  const router = useRouter();
  const { slug } = router.query;
  const { 
    currentProduct, 
    loading, 
    error, 
    fetchProduct, 
    addToCart, 
    addToWishlist, 
    removeFromWishlist,
    wishlist,
    cart,
    backupCart,
    clearCart
  } = useWooCommerce();
  
  const { 
    handleWishlistToggle, 
    showLoginPrompt, 
    closeLoginPrompt 
  } = useWishlistAuth();

  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Use initial product from server-side props or fetch from client
  const product = currentProduct || initialProduct;
  const productSlug = slug || initialSlug;

  // Fetch product when slug changes (only on client side if not already loaded)
  useEffect(() => {
    console.log('🔍 ProductDetailPage useEffect - slug:', productSlug);
    console.log('🔍 ProductDetailPage useEffect - currentProduct:', currentProduct);
    console.log('🔍 ProductDetailPage useEffect - initialProduct:', initialProduct);
    console.log('🔍 ProductDetailPage useEffect - loading:', loading);
    console.log('🔍 ProductDetailPage useEffect - error:', error);
    
    // Only fetch if we don't have a product and we have a slug
    if (productSlug && !currentProduct && !initialProduct) {
      console.log('🔍 Calling fetchProduct with slug:', productSlug);
      fetchProduct(productSlug);
    }
  }, [productSlug, currentProduct, initialProduct, fetchProduct]);

  // Check for review mode from URL parameters
  useEffect(() => {
    if (router.isReady) {
      const { review, orderId: urlOrderId } = router.query;
      if (review === 'true') {
        setShowReviewForm(true);
        setActiveTab('reviews');
        if (urlOrderId) {
          setOrderId(urlOrderId);
        }
        
        // Scroll to review form if hash is present
        setTimeout(() => {
          const reviewFormElement = document.getElementById('review-form');
          if (reviewFormElement) {
            reviewFormElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 500); // Small delay to ensure the form is rendered
      }
    }
  }, [router.isReady, router.query]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      const productToAdd = selectedVariation || product;
      addToCart(productToAdd, quantity);
      
      // Show success message (you can implement a toast notification here)
      console.log('Product added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle buy now (one-click checkout)
  const handleBuyNow = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      const productToAdd = selectedVariation || product;
      
      // Backup existing cart items first (if any)
      if (cart.length > 0) {
        backupCart();
      }
      
      // Clear existing cart items
      clearCart();
      
      // Add the current product to the now-empty cart
      addToCart(productToAdd, quantity);
      
      // Redirect to checkout page
      router.push('/checkout');
    } catch (error) {
      console.error('Error with buy now:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle wishlist toggle with authentication
  const handleWishlistToggleWithAuth = () => {
    if (!product) return;
    
    const isInWishlist = wishlist.some(item => item.id === product.id);
    handleWishlistToggle(addToWishlist, removeFromWishlist, product, isInWishlist)();
  };

  // Handle review form submission
  const handleReviewSubmit = (reviewData) => {
    // Review submitted successfully - no logging needed for user actions
    setShowReviewForm(false);
    // Remove review parameters from URL
    router.replace(`/products/${productSlug}`, undefined, { shallow: true });
  };

  // Handle review form cancellation
  const handleReviewCancel = () => {
    setShowReviewForm(false);
    // Remove review parameters from URL
    router.replace(`/products/${productSlug}`, undefined, { shallow: true });
  };

  // Generate breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    ...(product?.categories?.map(cat => ({
      label: cat.name,
      href: `/products?category=${cat.slug}`
    })) || []),
    ...(product ? [{ label: product.name, href: null }] : [])
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage 
          title="Product Not Found"
          message={error}
          action={{
            label: "Back to Products",
            onClick: () => router.push('/products')
          }}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage 
          title="Product Not Found"
          message="The product you're looking for doesn't exist."
          action={{
            label: "Back to Products",
            onClick: () => router.push('/products')
          }}
        />
      </div>
    );
  }

  const isInWishlist = wishlist.some(item => item.id === product.id);
  const isInCart = cart.some(item => item.id === product.id);

  return (
    <>
      <SEO 
        // Yoast SEO integration
        useYoast={true}
        yoastType="product"
        yoastId={product.slug}
        yoastIdType="SLUG"
        fallbackToManual={true}
        // Manual fallbacks (used if Yoast fails)
        title={product.name}
        description={product.short_description?.replace(/<[^>]*>/g, '') || product.name}
        image={product.images?.[0]?.src}
        url={`/products/${product.slug}`}
        type="product"
        canonical={`/products/${product.slug}`}
        keywords={product.tags?.map(tag => tag.name).join(', ')}
        structuredData={[
          generateProductStructuredData(product),
          generateBreadcrumbStructuredData(breadcrumbItems)
        ]}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* Main Product Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images - Sticky Panel */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="space-y-4">
                <LazyProductImageGallery 
                  images={product.images || []}
                  name={product.name}
                />
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <ProductInfo 
                product={product}
                isInWishlist={isInWishlist}
                onWishlistToggle={handleWishlistToggleWithAuth}
              />

              <ProductOptions 
                product={product}
                selectedVariation={selectedVariation}
                onVariationChange={setSelectedVariation}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                isAddingToCart={isAddingToCart}
                isInCart={isInCart}
              />

              {/* Product Details - SKU, Tags, Categories */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                {/* SKU */}
                {product.sku && (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">SKU:</span>
                    <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                      {product.sku}
                    </span>
                  </div>
                )}

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <span className="text-sm font-medium text-gray-700 mt-1">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {product.categories && product.categories.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <span className="text-sm font-medium text-gray-700 mt-1">Categories:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.categories.map((category) => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="mt-12">
            <LazyProductTabs 
              product={product}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              showReviewForm={showReviewForm}
              onReviewSubmit={handleReviewSubmit}
              onReviewCancel={handleReviewCancel}
              orderId={orderId}
            />
          </div>

          {/* Related Products */}
          {product.categories && product.categories.length > 0 && (
            <div className="mt-16">
              <LazyRelatedProducts 
                productId={product.id}
                categoryId={product.categories[0].id}
              />
            </div>
          )}
        </div>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={closeLoginPrompt}
        title="Sign in to use wishlist"
        message="Please sign in to add items to your wishlist and save them for later."
      />
    </>
  );
}
