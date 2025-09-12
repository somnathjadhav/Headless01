import React from 'react';
import { useSiteInfo } from '../../hooks/useSiteInfo';

export default function PageHeader({ 
  title, 
  subtitle, 
  description, 
  breadcrumbs = [],
  actions = null,
  className = ""
}) {
  const siteInfo = useSiteInfo();

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <div className="flex items-center">
                    <a href="/" className="text-gray-400 hover:text-gray-500">
                      <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      <span className="sr-only">Home</span>
                    </a>
                  </div>
                </li>
                {breadcrumbs.map((crumb, index) => (
                  <li key={index}>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      {crumb.href ? (
                        <a href={crumb.href} className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                          {crumb.name}
                        </a>
                      ) : (
                        <span className="ml-2 text-sm font-medium text-gray-500">
                          {crumb.name}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Main Header Content */}
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {title || siteInfo.name || 'NextGen Ecommerce'}
              </h1>
              
              {/* Subtitle */}
              {subtitle && (
                <h2 className="mt-1 text-lg font-medium text-gray-600">
                  {subtitle}
                </h2>
              )}
              
              {/* Description */}
              {description && (
                <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                  {description}
                </p>
              )}
            </div>

            {/* Actions */}
            {actions && (
              <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
