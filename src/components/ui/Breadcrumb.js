import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * Beautiful, minimal breadcrumb component
 * Automatically generates breadcrumbs based on the current route
 */
export default function Breadcrumb({ 
  customItems = null, 
  className = "",
  showHome = true 
}) {
  const router = useRouter();
  
  // Generate breadcrumb items from the current route
  const generateBreadcrumbs = () => {
    if (customItems) return customItems;
    
    const pathSegments = router.asPath.split('/').filter(segment => segment !== '');
    const breadcrumbs = [];
    
    // Add Home if enabled
    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        href: '/',
        isActive: router.asPath === '/'
      });
    }
    
    // Generate breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Convert segment to readable label
      let label = segment;
      if (segment === 'legal') {
        label = 'Legal';
      } else if (segment === 'privacy-policy') {
        label = 'Privacy Policy';
      } else if (segment === 'terms-conditions') {
        label = 'Terms & Conditions';
      } else if (segment === 'refund_returns') {
        label = 'Refund & Returns';
      } else if (segment === 'disclaimer') {
        label = 'Disclaimer';
      } else {
        // Convert kebab-case to Title Case
        label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isActive: isLast
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  if (breadcrumbs.length <= 1) return null;
  
  return (
    <nav 
      className={`flex items-center space-x-2 ${className}`}
      aria-label="Breadcrumb"
      style={{ fontSize: '14px !important' }}
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <svg 
                className="w-3 h-3 text-gray-400 mx-1.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            )}
            
            {item.isActive ? (
              <span className="text-gray-900 font-medium" style={{ fontSize: '14px' }}>
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                style={{ fontSize: '14px' }}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Enhanced Breadcrumb with title bar variant
 * Includes a beautiful, modern title bar with enhanced visual elements
 */
export function BreadcrumbWithTitle({ 
  title, 
  subtitle = null,
  breadcrumbs = null,
  className = "",
  titleClassName = "",
  showProgress = false,
  progressValue = 0,
  showActions = false,
  actions = null
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Main Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Section with Actions */}
          {showActions && actions && (
            <div className="flex justify-end mb-4">
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            </div>
          )}

          {/* Title Section with Enhanced Design */}
          <div className={`flex flex-col sm:flex-row sm:items-center ${subtitle ? 'sm:justify-between' : 'sm:justify-center'} mb-6`}>
            <div className={`${subtitle ? '' : 'text-center'} relative`}>
              {/* Title Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm text-gray-600 border border-gray-200/50 mb-3">
                <svg className="w-3 h-3 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Legal Document
              </div>
              
              {/* Main Title */}
              <h1 className={`text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight ${titleClassName}`}>
                {title}
              </h1>
              
              {/* Subtitle */}
              {subtitle && (
                <p className="mt-3 text-lg text-gray-600 max-w-2xl">
                  {subtitle}
                </p>
              )}

              {/* Progress Bar (if enabled) */}
              {showProgress && (
                <div className="mt-4 max-w-md">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progressValue}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressValue}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Breadcrumb Navigation */}
          <div className="flex justify-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20">
              <Breadcrumb customItems={breadcrumbs} />
            </div>
          </div>

          {/* Bottom Decorative Line */}
          <div className="mt-6 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-blue-100/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 bg-indigo-100/30 rounded-full blur-xl"></div>
    </div>
  );
}