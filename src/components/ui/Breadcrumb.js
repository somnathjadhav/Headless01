import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
            )}
            
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {index === 0 && <HomeIcon className="w-4 h-4 mr-1" />}
                {item.name || item.label}
              </Link>
            ) : (
              <span className="flex items-center text-sm font-medium text-gray-900">
                {index === 0 && <HomeIcon className="w-4 h-4 mr-1" />}
                {item.name || item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
