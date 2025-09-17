import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useCategoriesRest } from '../hooks/useCategoriesRest';
import SEO from '../components/layout/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import CategoryCard from '../components/woocommerce/CategoryCard';
import PageLayout from '../components/layout/PageLayout';

export default function CategoriesPage() {
  const { categories, loading, error } = useCategoriesRest();

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Categories' }
  ];

  if (loading) {
    return (
      <PageLayout 
        title="Product Categories"
        description="Browse our product categories"
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout 
        title="Product Categories"
        description="Browse our product categories"
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center">
            <ErrorMessage message={error} />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Product Categories"
      description="Browse all product categories"
      breadcrumbs={breadcrumbs}
      seo={{
        canonical: "/categories"
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No categories found
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
