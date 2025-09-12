import React from 'react';
import PageHeader from './PageHeader';
import SEO from './SEO';

export default function PageLayout({ 
  children, 
  title,
  subtitle,
  description,
  breadcrumbs = [],
  actions = null,
  showPageHeader = true,
  seo = {},
  className = ""
}) {
  return (
    <>
      <SEO 
        title={title}
        description={description}
        {...seo}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        {showPageHeader && (
          <PageHeader 
            title={title}
            subtitle={subtitle}
            description={description}
            breadcrumbs={breadcrumbs}
            actions={actions}
          />
        )}
        
        {/* Main Content */}
        <main className={`${className}`}>
          {children}
        </main>
      </div>
    </>
  );
}
