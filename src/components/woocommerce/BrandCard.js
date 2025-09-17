import React from 'react';
import Link from 'next/link';

export default function BrandCard({ brand }) {
  if (!brand) return null;

  return (
    <Link href={`/brands/${brand.slug}`}>
      <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Brand Logo */}
        <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          {brand.logo ? (
            <img 
              src={brand.logo}
              alt={`${brand.name} logo`}
              className="max-h-20 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Fallback brand initial */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50" style={{display: brand.logo ? 'none' : 'flex'}}>
            <div className="text-4xl font-bold text-gray-600">
              {brand.name.charAt(0)}
            </div>
          </div>
          
          {/* Product Count Badge - Top Right Corner */}
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 shadow-sm border border-gray-200">
              {brand.count}
            </span>
          </div>
        </div>

        {/* Brand Content */}
        <div className="p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
              {brand.name}
            </h3>
            {brand.description && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {brand.description.replace(/<[^>]*>/g, '')}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
