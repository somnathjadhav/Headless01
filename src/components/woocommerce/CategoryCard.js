import React from 'react';
import Link from 'next/link';

export default function CategoryCard({ category }) {
  if (!category) return null;

  // Get category image or placeholder
  const mainImage = category.image?.src || '/placeholder-product.svg';

  return (
    <div className="group bg-white rounded-lg overflow-hidden relative">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Link href={`/category/${category.slug}`}>
          <img
            src={mainImage}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-300 cursor-pointer group-hover:scale-105"
          />
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
