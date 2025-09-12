import React from 'react';
import Link from 'next/link';
import { useWooCommerce } from '../../context/WooCommerceContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ShoppingCartIcon, MinusIcon, PlusIcon, DeleteIcon, StarIcon } from '../icons';

export default function Cart() {
  const { cart, cartCount, removeFromCart, updateCartItem } = useWooCommerce();
  const { formatPrice } = useCurrency();

  // Debug cart state
  console.log('🛒 Cart component - cart state:', { 
    cart, 
    cartCount, 
    cartLength: cart.length,
    cartData: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity }))
  });

  // Calculate total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (cartCount === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-6">
          <ShoppingCartIcon className="w-12 h-12 text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h3>
        <p className="text-gray-600 text-lg mb-6">Start building your perfect wardrobe</p>
        <Link
          href="/products"
          className="inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Cart Header */}
      <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Shopping Cart
            </h2>
            <p className="text-sm text-gray-600">{cartCount} items in your cart</p>
          </div>
          <div className="flex items-center space-x-2 text-blue-600">
            <ShoppingCartIcon className="w-6 h-6" />
            <span className="font-semibold">Cart Items</span>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="divide-y divide-gray-100">
        {cart.map((item) => (
          <div key={item.id} className="px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
            {/* Product Image */}
            <div className="flex-shrink-0 relative">
              <Link href={`/products/${item.slug || item.id}`}>
                <img
                  src={item.images?.[0]?.src || '/placeholder-product.svg'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg shadow-sm hover:opacity-80 transition-opacity cursor-pointer"
                />
              </Link>
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {item.quantity}
              </div>
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.slug || item.id}`}>
                <h3 className="text-base font-medium text-gray-900 mb-1 hover:text-blue-600 transition-colors cursor-pointer" style={{fontSize: '16px', fontWeight: '500'}}>
                  {item.name}
                </h3>
              </Link>
              {item.attributes && item.attributes.length > 0 && (
                <p className="text-sm text-gray-500 mb-1">
                  {item.attributes.map(attr => attr.name + ': ' + attr.value).join(', ')}
                </p>
              )}
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">(4.8)</span>
              </div>
              <p className="text-lg font-medium text-gray-900" style={{fontWeight: '500'}}>
                {formatPrice(parseFloat(item.price || item.regular_price))}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 border border-gray-200 rounded-lg">
                <button
                  onClick={() => updateCartItem(item.id, item.quantity - 1)}
                  className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                  disabled={item.quantity <= 1}
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center">{item.quantity}</span>
                <button
                  onClick={() => updateCartItem(item.id, item.quantity + 1)}
                  className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Item Total */}
            <div className="text-right">
              <p className="text-lg font-medium text-gray-900" style={{fontWeight: '500'}}>
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeFromCart(item.id)}
              className="group flex items-center justify-center space-x-2 text-gray-500 hover:text-red-600 px-4 py-2 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
            >
              <DeleteIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm">Remove</span>
            </button>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="bg-gray-50 px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-medium text-gray-900">Total:</span>
          <span className="text-2xl font-bold text-gray-900">{formatPrice(cartTotal)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Link
            href="/products"
            className="flex-1 text-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
          >
            Continue Shopping
          </Link>
          <Link
            href="/checkout"
            className="flex-1 text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}