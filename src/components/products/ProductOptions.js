import React, { useState, useEffect } from 'react';
import { MinusIcon, PlusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCurrency } from '../../context/CurrencyContext';

export default function ProductOptions({ 
  product, 
  selectedVariation, 
  onVariationChange, 
  quantity, 
  onQuantityChange, 
  onAddToCart, 
  onBuyNow,
  isAddingToCart,
  isInCart 
}) {
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [availableVariations, setAvailableVariations] = useState([]);
  const { formatPrice } = useCurrency();

  // Render color swatches for color attributes
  const renderColorSwatches = (colors, selectedColor, onColorSelect) => {
    if (!Array.isArray(colors)) return null;
    
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
          const isSelected = selectedColor === color;
          
          return (
            <button
              key={index}
              onClick={() => onColorSelect(color)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm'
              }`}
              title={color}
            >
              <div 
                className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: colorValue }}
              />
              <span className="text-sm font-medium text-gray-700 capitalize">{color}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // Initialize selected attributes when product changes
  useEffect(() => {
    if (product && product.attributes) {
      const initialAttributes = {};
      product.attributes.forEach(attr => {
        if (attr.options && attr.options.length > 0) {
          initialAttributes[attr.name] = attr.options[0];
        }
      });
      setSelectedAttributes(initialAttributes);
    }
  }, [product]);

  // Handle attribute selection
  const handleAttributeChange = (attributeName, value) => {
    const newAttributes = {
      ...selectedAttributes,
      [attributeName]: value
    };
    setSelectedAttributes(newAttributes);

    // Find matching variation
    if (product.variations && product.variations.length > 0) {
      const matchingVariation = product.variations.find(variation => {
        // Check if variation has attributes array
        if (!variation.attributes || !Array.isArray(variation.attributes)) {
          return false;
        }
        
        return Object.keys(newAttributes).every(attrName => {
          const variationAttr = variation.attributes.find(attr => attr.name === attrName);
          return variationAttr && variationAttr.option === newAttributes[attrName];
        });
      });

      if (matchingVariation) {
        onVariationChange(matchingVariation);
      }
    }
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    const maxQuantity = selectedVariation?.stock_quantity || product.stock_quantity || 10;
    const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
    onQuantityChange(validQuantity);
  };

  // Check if product is available for purchase
  const isAvailable = () => {
    if (selectedVariation) {
      return selectedVariation.stock_status === 'instock';
    }
    return product.stock_status === 'instock';
  };

  // Get current price
  const getCurrentPrice = () => {
    const currentProduct = selectedVariation || product;
    if (currentProduct.on_sale && currentProduct.sale_price) {
      return currentProduct.sale_price;
    }
    return currentProduct.price || currentProduct.regular_price;
  };

  // Format price is now handled by currency context

  if (!product) return null;

  return (
    <div className="space-y-6">
      {/* Product Variations */}
      {product.attributes && product.attributes.length > 0 && (
        <div className="space-y-4">
          {product.attributes.map((attribute) => {
            const isColorAttribute = attribute.name.toLowerCase().includes('color') || 
                                   attribute.name.toLowerCase().includes('colour');
            
            return (
              <div key={attribute.name} className="space-y-2">
                <label 
                  className="block text-sm font-medium text-gray-700"
                  htmlFor={`attribute-${attribute.name}`}
                >
                  {attribute.name}:
                  <span className="ml-2 text-gray-500">
                    {selectedAttributes[attribute.name] || 'Select an option'}
                  </span>
                </label>
                
                {isColorAttribute ? (
                  renderColorSwatches(
                    attribute.options,
                    selectedAttributes[attribute.name],
                    (color) => handleAttributeChange(attribute.name, color)
                  )
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attribute.options.map((option) => (
                      <button
                        key={option}
                        id={`attribute-${attribute.name}-${option}`}
                        onClick={() => handleAttributeChange(attribute.name, option)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                          selectedAttributes[attribute.name] === option
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                        aria-label={`Select ${option} for ${attribute.name}`}
                        role="radio"
                        aria-checked={selectedAttributes[attribute.name] === option}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quantity Selector */}
      <div className="space-y-2">
        <label 
          className="block text-sm font-medium text-gray-700"
          htmlFor="quantity-input"
        >
          Quantity
        </label>
        <div className="flex items-center space-x-3" role="group" aria-label="Quantity selector">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Decrease quantity"
            aria-describedby="quantity-input"
          >
            <MinusIcon className="w-4 h-4" aria-hidden="true" />
          </button>
          
          <input
            id="quantity-input"
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            min="1"
            max={selectedVariation?.stock_quantity || product.stock_quantity || 10}
            className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= (selectedVariation?.stock_quantity || product.stock_quantity || 10)}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Increase quantity"
            aria-describedby="quantity-input"
          >
            <PlusIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Price Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-700">Total:</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(getCurrentPrice() * quantity)}
          </span>
        </div>
        {quantity > 1 && (
          <div className="text-sm text-gray-500 mt-1">
            {formatPrice(getCurrentPrice())} × {quantity}
          </div>
        )}
      </div>

      {/* Add to Cart Button */}
      <div className="space-y-3">
        <button
          onClick={onAddToCart}
          disabled={!isAvailable() || isAddingToCart}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
            isAvailable() && !isAddingToCart
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAddingToCart ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Adding to Cart...</span>
            </>
          ) : isInCart ? (
            <>
              <ShoppingCartIcon className="w-5 h-5" />
              <span>Already in Cart</span>
            </>
          ) : (
            <>
              <ShoppingCartIcon className="w-5 h-5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        {/* Stock Status */}
        {!isAvailable() && (
          <div className="text-center">
            <span className="text-red-600 text-sm font-medium">
              This product is currently out of stock
            </span>
          </div>
        )}

        {/* Variation Info */}
        {selectedVariation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <strong>Selected Variation:</strong> {selectedVariation.name}
            </div>
            {selectedVariation.sku && (
              <div className="text-xs text-blue-600 mt-1">
                SKU: {selectedVariation.sku}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Actions */}
      <div className="flex space-x-3">
        <button 
          onClick={onBuyNow}
          disabled={!isAvailable() || isAddingToCart}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
            isAvailable() && !isAddingToCart
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAddingToCart ? 'Processing...' : 'Buy Now'}
        </button>
        <button className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200">
          Ask Question
        </button>
      </div>
    </div>
  );
}
