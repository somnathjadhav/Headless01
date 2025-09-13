import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon, EyeIcon, ArrowPathIcon, ShoppingBagIcon } from '../icons';
import { useWooCommerce } from '../../context/WooCommerceContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlistAuth } from '../../hooks/useWishlistAuth';
import LoginPromptModal from '../modals/LoginPromptModal';
import QuickPreviewModal from './QuickPreviewModal';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const { addToWishlist, removeFromWishlist, wishlist, addToCart, cart } = useWooCommerce();
  const { formatPrice } = useCurrency();
  const { 
    handleWishlistToggle, 
    showLoginPrompt, 
    closeLoginPrompt, 
    getWishlistButtonStyles 
  } = useWishlistAuth();
  
  // Extract product data with fallbacks
  const {
    id,
    name,
    price,
    regular_price,
    sale_price,
    images,
    average_rating,
    rating_count,
    attributes,
    on_sale,
    categories
  } = product;

  // Check if product is in wishlist
  const isInWishlist = wishlist.some(item => item.id === id);
  
  // Check if product is in cart
  const isInCart = cart.some(item => item.id === id);

  // Calculate discount percentage
  const discountPercentage = on_sale && regular_price && sale_price 
    ? Math.round(((parseFloat(regular_price) - parseFloat(sale_price)) / parseFloat(regular_price)) * 100)
    : 0;

  // Get color attributes for swatches
  const colorAttributes = attributes?.filter(attr => 
    attr.name?.toLowerCase().includes('color') || 
    attr.name?.toLowerCase().includes('colour')
  ) || [];

  // Get first image or placeholder
  const mainImage = images?.[0]?.src || '/placeholder-product.svg';
  
  // Get second image for hover effect
  const hoverImage = images?.[1]?.src || mainImage;

  return (
    <div 
      className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/products/${product.slug || id}`}>
          {/* Main Image */}
          <Image
            src={mainImage}
            alt={name}
            width={400}
            height={400}
            className={`w-full h-full object-cover transition-transform duration-300 cursor-pointer ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
          
          {/* Hover Image */}
          {hoverImage !== mainImage && (
            <Image
              src={hoverImage}
              alt={name}
              width={400}
              height={400}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 cursor-pointer ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </Link>

        {/* Sale Badge */}
        {on_sale && discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}

        {/* RTL Badge (if applicable) */}
        {categories?.some(cat => cat.name?.toLowerCase().includes('rtl')) && (
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
              handleWishlistToggle(addToWishlist, removeFromWishlist, product, isInWishlist)();
            }}
            className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${
              getWishlistButtonStyles(isInWishlist).container
            }`}
          >
            <HeartIcon className={`w-4 h-4 ${
              getWishlistButtonStyles(isInWishlist).icon
            }`} />
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickView(true);
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
              addToCart(product);
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
          <Link href={`/products/${product.slug || id}`}>
            {name}
          </Link>
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-4 h-4 ${
                  star <= (average_rating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          {rating_count > 0 && (
            <span className="text-xs text-gray-500 ml-1">({rating_count})</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center mb-3">
          {on_sale && sale_price ? (
            <>
              <span className="text-base font-medium text-gray-900" style={{fontSize: '16px', fontWeight: '500'}}>
                {formatPrice(sale_price)}
              </span>
              <span className="text-sm text-gray-500 line-through ml-2">
                {formatPrice(regular_price)}
              </span>
            </>
          ) : (
            <span className="text-base font-medium text-gray-900" style={{fontSize: '16px', fontWeight: '500'}}>
              {formatPrice(price)}
            </span>
          )}
        </div>

        {/* Hot Sale Banner */}
        {on_sale && discountPercentage > 0 && (
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

      {/* Quick Preview Modal */}
      <QuickPreviewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={closeLoginPrompt}
        title="Sign in to use wishlist"
        message="Please sign in to add items to your wishlist and save them for later."
      />
    </div>
  );
}
