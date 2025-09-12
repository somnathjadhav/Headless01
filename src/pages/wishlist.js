import React from 'react';
import Wishlist from '../components/woocommerce/Wishlist';

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Wishlist</h1>
          <p className="text-xl text-gray-600">Save your favorite products for later</p>
        </div>
        
        <Wishlist />
      </div>
    </div>
  );
}
