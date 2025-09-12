import React from 'react';
import Link from 'next/link';
import { useCurrency } from '../context/CurrencyContext';

/**
 * Simple Product Card - No over-engineering
 * Just display product info and add to cart
 */
export default function SimpleProductCard({ product, onAddToCart }) {
  const { formatPrice } = useCurrency();
  
  if (!product) return <div>Loading...</div>;

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      {/* Product Image */}
      <Link href={`/products/${product.slug || product.id}`}>
        <img 
          src={product.images?.[0]?.src || '/placeholder.jpg'} 
          alt={product.name}
          className="w-full h-48 object-cover rounded mb-3 cursor-pointer hover:opacity-90 transition-opacity"
        />
      </Link>
      
      {/* Product Info */}
      <h3 className="font-semibold text-lg mb-2">
        <Link href={`/products/${product.slug || product.id}`} className="hover:text-blue-600 transition-colors">
          {product.name}
        </Link>
      </h3>
      <p className="text-gray-600 text-sm mb-3">
        {product.short_description?.replace(/<[^>]*>/g, '')}
      </p>
      
      {/* Price */}
      <div className="text-xl font-bold text-gray-900 mb-3">
        {formatPrice(product.price)}
      </div>
      
      {/* Add to Cart */}
      <button 
        onClick={() => onAddToCart(product)}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Add to Cart
      </button>
    </div>
  );
}
