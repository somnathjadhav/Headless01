import React from 'react';
import { HeartIcon, ShareIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlistAuth } from '../../hooks/useWishlistAuth';
import { useNotifications } from '../../context/NotificationContext';
import LoginPromptModal from '../modals/LoginPromptModal';

export default function ProductInfo({ product, isInWishlist, onWishlistToggle }) {
  const { formatPrice } = useCurrency();
  const { 
    canUseWishlist, 
    showLoginPrompt, 
    closeLoginPrompt, 
    getWishlistButtonText, 
    getWishlistButtonStyles,
    handleWishlistAction
  } = useWishlistAuth();
  
  if (!product) return null;

  const {
    name,
    price,
    regular_price,
    sale_price,
    on_sale,
    short_description,
    average_rating,
    rating_count,
    sku,
    stock_status,
    stock_quantity,
    categories,
    tags,
    attributes
  } = product;

  // Calculate discount percentage
  const discountPercentage = on_sale && regular_price && sale_price 
    ? Math.round(((parseFloat(regular_price) - parseFloat(sale_price)) / parseFloat(regular_price)) * 100)
    : 0;

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current opacity-50" />
        );
      } else {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  // Get stock status color and text
  const getStockStatus = () => {
    switch (stock_status) {
      case 'instock':
        return {
          text: stock_quantity ? `${stock_quantity} in stock` : 'In stock',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'outofstock':
        return {
          text: 'Out of stock',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      case 'onbackorder':
        return {
          text: 'On backorder',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      default:
        return {
          text: 'Stock status unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const stockInfo = getStockStatus();

  return (
    <div className="space-y-6">
      {/* Product Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
        
        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rating and Reviews */}
      {average_rating && rating_count > 0 && (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {renderStars(average_rating)}
          </div>
          <span className="text-sm text-gray-600">
            {average_rating} ({rating_count} review{rating_count !== 1 ? 's' : ''})
          </span>
        </div>
      )}

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          {on_sale && sale_price ? (
            <>
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(sale_price)}
              </span>
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(regular_price)}
              </span>
              {discountPercentage > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  -{discountPercentage}%
                </span>
              )}
            </>
          ) : (
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(price)}
            </span>
          )}
        </div>
      </div>

      {/* Stock Status */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockInfo.bgColor} ${stockInfo.color}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${stockInfo.color.replace('text-', 'bg-')}`}></div>
        {stockInfo.text}
      </div>

      {/* Short Description */}
      {short_description && (
        <div className="prose prose-sm max-w-none">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: short_description.replace(/<[^>]*>/g, '') 
            }}
            className="text-gray-600 leading-relaxed"
          />
        </div>
      )}



      {/* Action Buttons */}
      <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleWishlistAction(onWishlistToggle, product)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${
            getWishlistButtonStyles(isInWishlist).container
          }`}
        >
          {isInWishlist ? (
            <HeartSolidIcon className="w-5 h-5" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
          <span>{getWishlistButtonText(isInWishlist)}</span>
        </button>

        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200">
          <ShareIcon className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>

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
