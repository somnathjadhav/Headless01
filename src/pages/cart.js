import React from 'react';
import Cart from '../components/woocommerce/Cart';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Shopping Cart</h1>
          <p className="text-lg sm:text-xl text-gray-600 px-4">Review your items and proceed to checkout</p>
        </div>
        
        <Cart />
      </div>
    </div>
  );
}
