import React, { useState, useEffect } from 'react';
import { useWooCommerce } from '../context/WooCommerceContext';
import { useAuth } from '../context/AuthContext';

export default function CartDebug() {
  const { cart, cartCount, cartTotal, addToCart, removeFromCart, clearCart } = useWooCommerce();
  const { isAuthenticated, user } = useAuth();
  const [localStorageCart, setLocalStorageCart] = useState(null);

  useEffect(() => {
    // Check localStorage cart
    const savedCart = localStorage.getItem('eternitty-cart');
    setLocalStorageCart(savedCart ? JSON.parse(savedCart) : []);
  }, []);

  const handleClearCart = () => {
    clearCart();
    localStorage.removeItem('eternitty-cart');
    setLocalStorageCart([]);
  };

  const handleAddTestProduct = () => {
    const testProduct = {
      id: 'test-' + Date.now(),
      name: 'Test Product',
      price: '19.99',
      images: [{ src: '/placeholder-product.svg' }]
    };
    addToCart(testProduct, 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cart Debug Information</h1>
        
        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
            <p><strong>User Email:</strong> {user?.email || 'N/A'}</p>
          </div>
        </div>

        {/* Current Cart State */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Cart State (Context)</h2>
          <div className="space-y-2 mb-4">
            <p><strong>Cart Count:</strong> {cartCount}</p>
            <p><strong>Cart Total:</strong> ${cartTotal.toFixed(2)}</p>
            <p><strong>Cart Items:</strong> {cart.length}</p>
          </div>
          
          {cart.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-medium">Cart Items:</h3>
              {cart.map((item, index) => (
                <div key={item.id || index} className="bg-gray-50 p-3 rounded">
                  <p><strong>ID:</strong> {item.id}</p>
                  <p><strong>Name:</strong> {item.name}</p>
                  <p><strong>Price:</strong> ${item.price || item.regular_price}</p>
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Cart is empty</p>
          )}
        </div>

        {/* LocalStorage Cart */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">LocalStorage Cart</h2>
          <div className="space-y-2">
            <p><strong>Items in localStorage:</strong> {localStorageCart?.length || 0}</p>
            {localStorageCart && localStorageCart.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-medium">LocalStorage Items:</h3>
                {localStorageCart.map((item, index) => (
                  <div key={item.id || index} className="bg-gray-50 p-3 rounded">
                    <p><strong>ID:</strong> {item.id}</p>
                    <p><strong>Name:</strong> {item.name}</p>
                    <p><strong>Price:</strong> ${item.price || item.regular_price}</p>
                    <p><strong>Quantity:</strong> {item.quantity}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No items in localStorage</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={handleAddTestProduct}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Test Product
            </button>
            <button 
              onClick={handleClearCart}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Cart
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Reload Page
            </button>
          </div>
        </div>

        {/* Recent Console Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Open browser developer tools (F12)</p>
            <p>2. Go to Console tab</p>
            <p>3. Look for cart-related logs (🛒 emoji)</p>
            <p>4. Check if items are being added automatically</p>
            <p>5. Look for any errors or unexpected behavior</p>
          </div>
        </div>
      </div>
    </div>
  );
}
