import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CategoryCard({ category }) {
  const [imageError, setImageError] = useState(false);
  
  if (!category) return null;

  // Get category image or placeholder
  const mainImage = category.image?.src || '/placeholder-product.svg';
  const fallbackImage = '/placeholder-product.svg';

  return (
    <div className="group bg-white rounded-lg overflow-hidden relative">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Link href={`/category/${category.slug}`}>
          <div className="w-full h-full relative cursor-pointer">
            {!imageError && mainImage !== fallbackImage ? (
              <Image
                src={mainImage}
                alt={category.name || 'Category'}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">{category.name}</p>
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Category Name Button */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <Link href={`/category/${category.slug}`}>
          <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gray-50">
            {category.name}
          </button>
        </Link>
      </div>

      {/* Product Count Badge */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-black bg-opacity-70 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
          {category.count || 0} {category.count === 1 ? 'product' : 'products'}
        </span>
      </div>
    </div>
  );
}
