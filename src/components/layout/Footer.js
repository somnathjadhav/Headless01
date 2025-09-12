import React, { useState } from 'react';
import Link from 'next/link';
import { useGlobalTypography } from '../../hooks/useGlobalTypography';
import { useSiteInfo } from '../../hooks/useSiteInfo';
import { 
  FacebookIcon, 
  InstagramIcon, 
  TikTokIcon, 
  YouTubeIcon, 
  SnapchatIcon,
  AmexIcon,
  KlarnaIcon,
  CirrusIcon,
  MastercardIcon,
  WesternUnionIcon,
  VisaIcon,
  PayPalIcon,
  ChevronDownIcon
} from '../icons';

export default function Footer() {
  // Apply global typography
  useGlobalTypography();
  
  // Site info from WordPress backend
  const siteInfo = useSiteInfo();
  
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('United States (USD $)');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };


  return (
    <footer className="bg-white text-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Help Customers Column */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Help Customers</h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Find a location nearest you to reduce shipping costs and make shopping easier. 
              <span className="font-bold"> Show on google maps.</span>
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-gray-600 text-sm">{siteInfo.contact?.phone || '+1 (973) 435-3638'}</p>
              <p className="text-gray-600 text-sm">{siteInfo.contact?.email || 'info@glozinstore.com'}</p>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex space-x-3">
              {siteInfo.socialMedia?.facebook && (
                <a href={siteInfo.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-colors">
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {siteInfo.socialMedia?.instagram && (
                <a href={siteInfo.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-pink-600 hover:border-pink-600 transition-colors">
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {siteInfo.socialMedia?.twitter && (
                <a href={siteInfo.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-400 hover:border-blue-400 transition-colors">
                  <TikTokIcon className="w-4 h-4" />
                </a>
              )}
              {siteInfo.socialMedia?.youtube && (
                <a href={siteInfo.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 hover:border-red-600 transition-colors">
                  <YouTubeIcon className="w-4 h-4" />
                </a>
              )}
              {siteInfo.socialMedia?.linkedin && (
                <a href={siteInfo.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-700 hover:border-blue-700 transition-colors">
                  <SnapchatIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Our Company Column */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Our Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                  Terms Of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/store-location" className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                  Store Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Shop Categories Column */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Shop Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/hot-deals" className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                  Hot Deals
                </Link>
              </li>
              <li>
                <Link href="/best-seller" className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                  Best Seller
                </Link>
              </li>
              <li>
                <Link href="/sale" className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                  Sale & Special Offers
                </Link>
              </li>
              <li>
                <Link href="/leggings" className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                  Leggings
                </Link>
              </li>
              <li>
                <Link href="/popular-trends" className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                  Popular Trends
                </Link>
              </li>
              <li>
                <Link href="/loungewear" className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                  Loungewear
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup Column */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Sign Up to Newsletter</h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Sign up for 10% off your first purchase and free shipping. Updates information on Sales and Offers.
            </p>
            
            {/* Newsletter Form */}
            <form onSubmit={handleNewsletterSubmit} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
            
            {/* Disclaimer */}
            <p className="text-xs text-gray-500 leading-relaxed">
              ***By entering the e-mail you accept the{' '}
              <Link href="/terms" className="font-bold hover:underline">terms and conditions</Link>
              {' '}and the{' '}
              <Link href="/privacy" className="font-bold hover:underline">privacy policy.</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Left Side - Language, Currency, Copyright */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              {/* Language Selector */}
              <div className="relative">
                <button className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  {language}
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              {/* Currency Selector */}
              <div className="relative">
                <button className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  <span className="mr-2">🇺🇸</span>
                  {currency}
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              {/* Copyright */}
              <p className="text-sm text-gray-600">
                © 2025 {siteInfo.name || 'NextGen Ecommerce'}. All rights reserved.
              </p>
            </div>
            
            {/* Right Side - Payment Methods */}
            <div className="flex items-center space-x-4">
              {/* Payment Method Icons */}
              <div className="flex items-center space-x-2">
                <AmexIcon className="w-8 h-5 text-gray-600" />
                <KlarnaIcon className="w-8 h-5 text-gray-600" />
                <CirrusIcon className="w-8 h-5 text-gray-600" />
                <MastercardIcon className="w-8 h-5 text-gray-600" />
                <WesternUnionIcon className="w-8 h-5 text-gray-600" />
                <VisaIcon className="w-8 h-5 text-gray-600" />
                <PayPalIcon className="w-8 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
