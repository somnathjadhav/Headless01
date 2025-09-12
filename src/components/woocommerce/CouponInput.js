import React, { useState } from 'react';
import { useWooCommerce } from '../../context/WooCommerceContext';
import { TagIcon, XIcon } from '../icons';

export default function CouponInput() {
  const { cart, appliedCoupon, applyCoupon, removeCoupon } = useWooCommerce();
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          couponCode: couponCode.trim(),
          cartTotal: cartTotal
        }),
      });

      const data = await response.json();

      if (data.success) {
        applyCoupon(data.coupon);
        setCouponCode('');
        setError('');
      } else {
        setError(data.message || 'Failed to apply coupon');
      }
    } catch (error) {
      setError('Failed to apply coupon. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-900">Coupon Code</h3>
        {appliedCoupon && (
          <button
            onClick={handleRemoveCoupon}
            className="text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <XIcon className="w-4 h-4 mr-1" />
            Remove
          </button>
        )}
      </div>

      {appliedCoupon ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TagIcon className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                {appliedCoupon.code} - {appliedCoupon.description}
              </span>
            </div>
            <span className="text-sm font-medium text-green-600">
              {appliedCoupon.discount_type === 'percent' 
                ? `${appliedCoupon.amount}% off` 
                : `₹${appliedCoupon.amount} off`
              }
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isLoading || !couponCode.trim()}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Applying...' : 'Apply'}
            </button>
          </div>
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
