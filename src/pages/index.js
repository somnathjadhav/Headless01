import React, { useEffect, useState } from 'react';
import { useGlobalTypography } from '../hooks/useGlobalTypography';
import { useWooCommerce } from '../context/WooCommerceContext';
import { useCurrency } from '../context/CurrencyContext';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  ArrowRightIcon,
  CheckIcon,
  TruckIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  FireIcon,
  GiftIcon
} from '../components/icons';

export default function HomePage() {
  const { products, categories, fetchProducts, fetchCategories } = useWooCommerce();
  const { formatPrice } = useCurrency();

  // Apply global typography
  useGlobalTypography();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Welcome to Our Store
        </h1>
        <p className="text-center text-gray-600">
          This is a test homepage with hooks and icons loaded.
        </p>
        <p className="text-center text-gray-600 mt-4">
          Products: {products.length}, Categories: {categories.length}
        </p>
        
        {/* Test icons */}
        <div className="flex justify-center space-x-4 mt-8">
          <HeartIcon className="w-8 h-8 text-red-500" />
          <ShoppingCartIcon className="w-8 h-8 text-blue-500" />
          <ArrowRightIcon className="w-8 h-8 text-green-500" />
          <CheckIcon className="w-8 h-8 text-green-600" />
          <TruckIcon className="w-8 h-8 text-purple-500" />
          <ShieldCheckIcon className="w-8 h-8 text-orange-500" />
          <CurrencyDollarIcon className="w-8 h-8 text-yellow-500" />
          <SparklesIcon className="w-8 h-8 text-pink-500" />
          <FireIcon className="w-8 h-8 text-red-600" />
          <GiftIcon className="w-8 h-8 text-indigo-500" />
        </div>
      </div>
    </div>
  );
}