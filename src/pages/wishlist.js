import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Wishlist from '../components/woocommerce/Wishlist';
import PleaseSignIn from '../components/auth/PleaseSignIn';

export default function WishlistPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
    }
  }, [isAuthenticated]);

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <PleaseSignIn 
        title="View Your Wishlist"
        message="Please sign in to view and manage your saved items. Your wishlist helps you keep track of products you love."
        redirectTo="wishlist"
      />
    );
  }

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
