import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeartIcon, EyeIcon, ArrowPathIcon, ShoppingBagIcon } from '../icons';
import { useWooCommerce } from '../../context/WooCommerceContext';
import { useCurrency } from '../../context/CurrencyContext';
import QuickPreviewModal from '../woocommerce/QuickPreviewModal';

export default function RelatedProducts({ productId, categoryId }) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showQuickView, setShowQuickView] = useState(null);
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart } = useWooCommerce();
  const { formatPrice } = useCurrency();

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch products from the same category
        const response = await fetch(`/api/products?category=${categoryId}&per_page=4&exclude=${productId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch related products');
        }

        const data = await response.json();
        setRelatedProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId && productId) {
      fetchRelatedProducts();
    }
  }, [categoryId, productId]);

  // Handle add to cart
  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (product) => {
    const isInWishlist = wishlist.some(item => item.id === product.id);
    
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // Handle quick view
  const handleQuickView = (product) => {
    setShowQuickView(product);
  };

  // Format price is now handled by currency context

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
        <div className="text-center py-8 text-gray-500">
          <p>Unable to load related products: {error}</p>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
        <Link 
          href="/products"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          View All Products →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => {
          const isInWishlist = wishlist.some(item => item.id === product.id);
          const isInCart = cart.some(item => item.id === product.id);
          const isHovered = hoveredCard === product.id;
          const discountPercentage = product.on_sale && product.regular_price && product.sale_price 
            ? Math.round(((parseFloat(product.regular_price) - parseFloat(product.sale_price)) / parseFloat(product.regular_price)) * 100)
            : 0;

          // Get color attributes for swatches
          const colorAttributes = product.attributes?.filter(attr => 
            attr.name?.toLowerCase().includes('color') || 
            attr.name?.toLowerCase().includes('colour')
          ) || [];

          // Get first image or placeholder
          const mainImage = product.images?.[0]?.src || '/placeholder-product.svg';
          
          // Get second image for hover effect
          const hoverImage = product.images?.[1]?.src || mainImage;

          return (
            <div 
              key={product.id} 
              className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              onMouseEnter={() => setHoveredCard(product.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Link href={`/products/${product.slug || product.id}`}>
                  {/* Main Image */}
                  <img
                    src={mainImage}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-300 cursor-pointer ${
                      isHovered ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  
                  {/* Hover Image */}
                  {hoverImage !== mainImage && (
                    <img
                      src={hoverImage}
                      alt={product.name}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 cursor-pointer ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  )}
                </Link>

                {/* Sale Badge */}
                {product.on_sale && discountPercentage > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{discountPercentage}%
                  </div>
                )}

                {/* RTL Badge (if applicable) */}
                {product.categories?.some(cat => cat.name?.toLowerCase().includes('rtl')) && (
                  <div className="absolute bottom-3 right-3 bg-black text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center">
                    RTL
                  </div>
                )}

                {/* Hover Action Icons */}
                <div className={`absolute right-3 top-3 flex flex-col space-y-2 transition-all duration-300 ${
                  isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleWishlistToggle(product);
                    }}
                    className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${
                      isInWishlist 
                        ? 'bg-pink-500 hover:bg-pink-600' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <HeartIcon className={`w-4 h-4 ${
                      isInWishlist ? 'text-white' : 'text-gray-600'
                    }`} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickView(product);
                    }}
                    className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <ArrowPathIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <div className={`absolute bottom-0 left-0 right-0 transform transition-transform duration-300 ${
                  isHovered ? 'translate-y-0' : 'translate-y-full'
                }`}>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className={`w-full py-3 text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                      isInCart 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-white text-gray-900 hover:bg-gray-900 hover:text-white'
                    }`}
                  >
                    <ShoppingBagIcon className="w-4 h-4" />
                    <span>{isInCart ? 'Item in the cart' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Product Name */}
                <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors" style={{fontSize: '16px', fontWeight: '500'}}>
                  <Link href={`/products/${product.slug || product.id}`}>
                    {product.name}
                  </Link>
                </h3>

                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (product.average_rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {product.rating_count > 0 && (
                    <span className="text-xs text-gray-500 ml-1">({product.rating_count})</span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center mb-3">
                  {product.on_sale && product.sale_price ? (
                    <>
                      <span className="text-base font-medium text-gray-900" style={{fontSize: '16px', fontWeight: '500'}}>
                        {formatPrice(product.sale_price)}
                      </span>
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatPrice(product.regular_price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-base font-medium text-gray-900" style={{fontSize: '16px', fontWeight: '500'}}>
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Hot Sale Banner */}
                {product.on_sale && discountPercentage > 0 && (
                  <div className="bg-black text-white text-xs font-bold px-3 py-1 rounded mb-3 text-center">
                    ⚡ HOT SALE {discountPercentage}% OFF ⚡
                  </div>
                )}

                {/* Color Swatches */}
                {colorAttributes.length > 0 && (
                  <div className="flex items-center space-x-2">
                    {colorAttributes[0].options?.slice(0, 3).map((color, index) => (
                      <button
                        key={index}
                        className={`w-4 h-4 rounded-full border-2 ${
                          index === 0 ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Preview Modal */}
      {showQuickView && (
        <QuickPreviewModal
          product={showQuickView}
          isOpen={!!showQuickView}
          onClose={() => setShowQuickView(null)}
        />
      )}
    </div>
  );
}
