import React, { useState, useEffect } from 'react';
import { StarIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ReviewForm from '../reviews/ReviewForm';

export default function ProductTabs({ product, activeTab, onTabChange, showReviewForm, onReviewSubmit, onReviewCancel, orderId }) {
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

  // Fetch reviews when component mounts or product changes
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return;
      
      setReviewsLoading(true);
      setReviewsError(null);
      
      try {
        console.log('Fetching reviews for product:', product.id);
        const response = await fetch(`/api/products/${product.id}/reviews?per_page=10`);
        if (response.ok) {
          const data = await response.json();
          console.log('Reviews API response:', data);
          setReviews(data.reviews || []);
        } else {
          console.error('Failed to fetch reviews, status:', response.status);
          setReviewsError('Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviewsError('Failed to fetch reviews');
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [product?.id]);

  if (!product) return null;

  const tabs = [
    { id: 'description', label: 'Description', icon: null },
    { id: 'specifications', label: 'Specifications', icon: null },
    { id: 'reviews', label: 'Reviews', icon: StarIcon },
    { id: 'shipping', label: 'Shipping & Returns', icon: TruckIcon }
  ];

  // Calculate average rating from reviews
  const calculateAverageRating = () => {
    try {
      console.log('Calculating average rating:', {
        productAverageRating: product.average_rating,
        productRatingCount: product.rating_count,
        reviewsLength: reviews.length,
        reviews: reviews.map(r => ({ id: r.id, rating: r.rating }))
      });

      // If we have reviews, calculate from them (this takes priority)
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => {
          const reviewRating = parseFloat(review.rating) || 0;
          console.log('Review rating:', review.id, reviewRating);
          return sum + reviewRating;
        }, 0);
        
        const average = totalRating / reviews.length;
        console.log('Calculated average from reviews:', average, 'from total:', totalRating, 'count:', reviews.length);
        return isNaN(average) ? 0 : average;
      }

      // Fallback to product average rating if no reviews fetched yet
      if (product.average_rating && parseFloat(product.average_rating) > 0) {
        const rating = parseFloat(product.average_rating);
        console.log('Using product average rating:', rating);
        return isNaN(rating) ? 0 : rating;
      }
      
      console.log('No reviews found and no product rating, returning 0');
      return 0;
    } catch (error) {
      console.error('Error calculating average rating:', error);
      return 0;
    }
  };

  // Get review count
  const getReviewCount = () => {
    // Prioritize fetched reviews count over product rating_count
    if (reviews.length > 0) {
      return reviews.length;
    }
    return product.rating_count || 0;
  };

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

  // Render color swatches for color attributes
  const renderColorSwatches = (colors) => {
    if (!Array.isArray(colors)) return colors;
    
    return (
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => {
          // Convert color name to CSS color value
          const getColorValue = (colorName) => {
            const colorMap = {
              'white': '#FFFFFF',
              'black': '#000000',
              'red': '#EF4444',
              'blue': '#3B82F6',
              'green': '#10B981',
              'yellow': '#F59E0B',
              'purple': '#8B5CF6',
              'pink': '#EC4899',
              'gray': '#6B7280',
              'grey': '#6B7280',
              'brown': '#92400E',
              'orange': '#F97316',
              'navy': '#1E3A8A',
              'beige': '#F5F5DC',
              'cream': '#FFFDD0',
              'classic blue': '#1E40AF',
              'light blue': '#60A5FA',
              'dark blue': '#1E3A8A',
              'maroon': '#7C2D12',
              'burgundy': '#7C2D12',
              'teal': '#0D9488',
              'lime': '#84CC16',
              'indigo': '#4F46E5',
              'violet': '#7C3AED',
              'cyan': '#06B6D4',
              'magenta': '#D946EF',
              'olive': '#65A30D',
              'coral': '#FF6B6B',
              'salmon': '#FB7185',
              'turquoise': '#14B8A6',
              'gold': '#F59E0B',
              'silver': '#9CA3AF',
              'bronze': '#CD7F32',
              'copper': '#B87333'
            };
            
            const normalizedColor = colorName.toLowerCase().trim();
            return colorMap[normalizedColor] || '#6B7280'; // Default gray if color not found
          };

          const colorValue = getColorValue(color);
          
          return (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: colorValue }}
                title={color}
              />
              <span className="text-sm text-gray-700 capitalize">{color}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Format description content
  const formatDescription = (description) => {
    if (!description) return null;
    
    // Check if it's already HTML
    if (description.includes('<') && description.includes('>')) {
      return description;
    }
    
    // Convert plain text to formatted HTML
    const lines = description.split('\n').filter(line => line.trim() !== '');
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      
      // Check if it's a heading (starts with specific patterns)
      if (trimmedLine.match(/^(Key Highlights?|Features?|Specifications?|Benefits?|Details?):?$/i)) {
        return `<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">${trimmedLine.replace(/:$/, '')}</h3>`;
      }
      
      // Check if it's a bullet point (starts with dash, bullet, or similar)
      if (trimmedLine.match(/^[-•*]\s+/)) {
        return `<li class="mb-2">${trimmedLine.replace(/^[-•*]\s+/, '')}</li>`;
      }
      
      // Check if it's a numbered list item
      if (trimmedLine.match(/^\d+\.\s+/)) {
        return `<li class="mb-2">${trimmedLine.replace(/^\d+\.\s+/, '')}</li>`;
      }
      
      // Regular paragraph
      return `<p class="mb-4">${trimmedLine}</p>`;
    });
    
    // Wrap consecutive list items in ul/ol
    let result = '';
    let inList = false;
    let listType = 'ul';
    
    for (let i = 0; i < formattedLines.length; i++) {
      const line = formattedLines[i];
      
      if (line.startsWith('<li')) {
        if (!inList) {
          // Determine list type
          listType = line.includes('class="mb-2"') ? 'ul' : 'ol';
          result += `<${listType} class="list-disc list-inside mb-4 space-y-2">`;
          inList = true;
        }
        result += line;
      } else {
        if (inList) {
          result += `</${listType}>`;
          inList = false;
        }
        result += line;
      }
    }
    
    if (inList) {
      result += `</${listType}>`;
    }
    
    return result;
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="max-w-none">
            {product.description ? (
              <div 
                dangerouslySetInnerHTML={{ __html: formatDescription(product.description) }}
                className="prose-content space-y-6"
              />
            ) : (
              <div className="text-gray-600 space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">No detailed description available for this product.</p>
                </div>
                {product.short_description && (
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">Short Description</h4>
                    <div 
                      dangerouslySetInnerHTML={{ __html: formatDescription(product.short_description) }}
                      className="prose-content"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'specifications':
        return (
          <div className="space-y-8">
            {/* Product Attributes */}
            {product.attributes && product.attributes.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Product Specifications
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {product.attributes.map((attribute, index) => {
                    const isColorAttribute = attribute.name.toLowerCase().includes('color') || 
                                           attribute.name.toLowerCase().includes('colour');
                    
                    return (
                      <div key={index} className="px-8 py-6 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-gray-900 capitalize text-lg">
                            {attribute.name}
                          </span>
                          <div className="text-gray-700 text-right max-w-md">
                            {isColorAttribute && Array.isArray(attribute.options) ? (
                              renderColorSwatches(attribute.options)
                            ) : (
                              <span>
                                {Array.isArray(attribute.options) 
                                  ? attribute.options.join(', ') 
                                  : attribute.options
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg">No specifications available for this product.</p>
                </div>
              </div>
            )}

            {/* Additional Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.sku && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Product Code</h4>
                  <p className="text-gray-600">{product.sku}</p>
                </div>
              )}
              
              {product.categories && product.categories.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-8">
            {/* Review Form - Show when in review mode */}
            {showReviewForm && (
              <div className="mb-8">
                <ReviewForm
                  productId={product.id}
                  productName={product.name}
                  onReviewSubmit={onReviewSubmit}
                  onCancel={onReviewCancel}
                />
              </div>
            )}

            {/* Reviews Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Customer Reviews</h3>
                {getReviewCount() > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(calculateAverageRating())}
                    </div>
                    <span className="text-lg text-gray-600 font-medium">
                      {Number(calculateAverageRating()).toFixed(1)} ({getReviewCount()} review{getReviewCount() !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>

              {getReviewCount() > 0 ? (
                <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="text-5xl font-bold text-gray-900 mb-3">
                    {Number(calculateAverageRating()).toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center space-x-1 mb-3">
                    {renderStars(calculateAverageRating())}
                  </div>
                  <p className="text-gray-600 text-lg">
                    Based on {getReviewCount()} review{getReviewCount() !== 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <StarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>

            {/* Individual Reviews */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">Recent Reviews</h4>
              
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading reviews...</p>
                </div>
              ) : reviewsError ? (
                <div className="text-center py-8 text-red-600">
                  <p>{reviewsError}</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {review.reviewer_avatar_urls?.['48'] ? (
                            <img
                              src={review.reviewer_avatar_urls['48']}
                              alt={review.reviewer}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-semibold text-lg">
                                {review.reviewer?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h5 className="font-semibold text-gray-900">{review.reviewer}</h5>
                            <div className="flex items-center space-x-1">
                              {renderStars(review.rating)}
                            </div>
                            {review.verified && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-3">
                            {new Date(review.date_created).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-gray-700 leading-relaxed">{review.review}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <StarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-4">No reviews available yet.</p>
                  {!showReviewForm && (
                    <button 
                      onClick={() => {
                        // This would trigger the review form to show
                        // For now, we'll just show a message
                        console.log('Write a review clicked');
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                      Write a Review
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TruckIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Free Shipping</h4>
                    <p className="text-gray-600 text-sm">Free shipping on orders over ₹500</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Standard Shipping</h4>
                    <p className="text-gray-600 text-sm">3-5 business days - ₹50</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Express Shipping</h4>
                    <p className="text-gray-600 text-sm">1-2 business days - ₹150</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Returns Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ArrowPathIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Returns & Exchanges</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">30-Day Return Policy</h4>
                    <p className="text-gray-600 text-sm">Return items within 30 days of purchase for a full refund</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Easy Exchange</h4>
                    <p className="text-gray-600 text-sm">Exchange for different size or color within 14 days</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Quality Guarantee</h4>
                    <p className="text-gray-600 text-sm">We guarantee the quality of all our products</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-gray-600 text-sm mb-3">
                If you have any questions about shipping or returns, please contact our customer service team.
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Contact Support
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <nav className="flex space-x-0 px-6" aria-label="Tabs">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isFirst = index === 0;
            const isLast = index === tabs.length - 1;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative py-4 px-6 font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'text-gray-900 bg-white border-b-2 border-blue-500 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } ${isFirst ? 'rounded-tl-lg' : ''} ${isLast ? 'rounded-tr-lg' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  {Icon && (
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  )}
                  <span className={isActive ? 'font-semibold' : 'font-medium'}>
                    {tab.label}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {renderTabContent()}
      </div>
    </div>
  );
}
