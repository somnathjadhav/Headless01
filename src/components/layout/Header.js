import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useGlobalTypography } from '../../hooks/useGlobalTypography';
import { useWooCommerce } from '../../context/WooCommerceContext';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useThemeOptions } from '../../hooks/useThemeOptions';
import { useSiteInfo } from '../../hooks/useSiteInfo';
import { useHeaderFooter } from '../../hooks/useHeaderFooter';
import { useMainMenu } from '../../hooks/useMainMenu';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  XIcon, 
  ChevronDownIcon, 
  SearchIcon, 
  UserIcon, 
  HeartIcon, 
  ShoppingBagIcon,
  LoginIcon,
  LogoutIcon,
  EditIcon,
  CreditCardIcon,
  TruckIcon
} from '../icons';

export default function Header() {
  // Apply global typography
  useGlobalTypography();
  
  // Router for navigation
  const router = useRouter();
  
  // WooCommerce context
  const { cart, cartCount, wishlist, isCartDropdownOpen, setIsCartDropdownOpen } = useWooCommerce();
  
  // Auth context
  const { user, isAuthenticated, logout } = useAuth();
  
  // Modal context
  const { openAuthModal } = useModal();
  
  
  // Currency context
  const { formatPrice } = useCurrency();
  
  // Theme options for dynamic branding
  const { themeOptions } = useThemeOptions();
  
  // Site info from WordPress backend
  const siteInfo = useSiteInfo();
  
  // Header/footer settings from WordPress backend
  const headerFooterData = useHeaderFooter();
  
  // WordPress main menu
  const { menuData: mainMenu } = useMainMenu();
  
  // Direct logo state for immediate loading
  const [directLogo, setDirectLogo] = useState('http://localhost/wp-content/uploads/2025/09/logoipsum-373.svg');
  const [logoLoading] = useState(false);
  

  // Fetch logo from WordPress backend
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch('/api/header-footer');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.lightLogo) {
            setDirectLogo(data.data.lightLogo);
          }
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };

    fetchLogo();
  }, []);
  
  // Select appropriate logo - prioritize direct logo, then WordPress logo
  const currentLogo = directLogo || 
    headerFooterData.lightLogo || 
    themeOptions.branding.light_logo || 
    themeOptions.branding.logo;

  // Logo is now working with direct state management
  
  
  // State for banner visibility, mobile menu, and profile dropdown
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Refs for dropdowns
  const profileDropdownRef = useRef(null);
  const cartDropdownRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Handle logout with immediate redirect
  const handleLogout = useCallback(() => {
    logout();
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/');
  }, [logout, router]);

  // Convert WordPress menu items to navigation format
  const convertMenuItemsToNavigation = (menuItems) => {
    if (!menuItems || !Array.isArray(menuItems)) return [];
    
    return menuItems.map(item => ({
      name: item.title,
      href: item.url,
      hasDropdown: item.children && item.children.length > 0,
      dropdownItems: item.children ? item.children.map(child => ({
        name: child.title,
        href: child.url
      })) : undefined,
      isHot: item.title.toLowerCase().includes('sale') || item.title.toLowerCase().includes('hot')
    }));
  };

  // Default navigation items (fallback) - matches WordPress menu structure
  // const defaultNavigationItems = [
  //   { name: 'Shop', href: '/products', hasDropdown: false },
  //   { name: 'Kids', href: '/products?category=kids', hasDropdown: false },
  //   { name: 'Men', href: '/products?category=men', hasDropdown: false },
  //   { name: 'Women', href: '/products?category=women', hasDropdown: false },
  //   { name: 'Contact Us', href: '/contact', hasDropdown: false }
  // ];

  // Use WordPress menu if available, otherwise use default
  const navigationItems = mainMenu && mainMenu.items && mainMenu.items.length > 0 
    ? convertMenuItemsToNavigation(mainMenu.items)
    : [
        { name: 'Shop', href: '/products', hasDropdown: false },
        { name: 'Kids', href: '/products?category=kids', hasDropdown: false },
        { name: 'Men', href: '/products?category=men', hasDropdown: false },
        { name: 'Women', href: '/products?category=women', hasDropdown: false },
        { name: 'Contact Us', href: '/contact', hasDropdown: false }
      ];

  // Profile dropdown items based on authentication status
  const profileItems = isAuthenticated ? [
    { name: `Welcome, ${user?.name || 'User'}`, href: '/account', icon: UserIcon, isHeader: true },
    { name: 'My Account', href: '/account', icon: UserIcon },
    { name: 'Orders', href: '/orders', icon: TruckIcon },
    { name: 'Wishlist', href: '/wishlist', icon: HeartIcon },
    { name: 'Cart', href: '/cart', icon: ShoppingBagIcon },
    { name: 'Checkout', href: '/checkout', icon: CreditCardIcon },
    { name: 'Settings', href: '/settings', icon: EditIcon },
    { name: 'Sign Out', action: handleLogout, icon: LogoutIcon, isAction: true }
  ] : [
    { name: 'Sign In', action: () => openAuthModal('signin'), icon: LoginIcon, isAction: true },
    { name: 'Sign Up', action: () => openAuthModal('signup'), icon: UserIcon, isAction: true },
    { name: 'Cart', href: '/cart', icon: ShoppingBagIcon },
    { name: 'Wishlist', href: '/wishlist', icon: HeartIcon }
  ];

  // Handle click outside dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
        setIsCartDropdownOpen(false);
      }
      if ((desktopSearchRef.current && !desktopSearchRef.current.contains(event.target)) &&
          (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target))) {
        // Add a small delay to allow Link clicks to process
        setTimeout(() => {
          setShowSearchResults(false);
        }, 100);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsCartDropdownOpen]);

  // Search functionality
  const handleSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(term)}&per_page=5`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.products || []);
        setShowSearchResults(true);
      } else {
        console.error('Search API error:', response.status, response.statusText);
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch]);

  return (
    <>
      {/* Top Banner - Sale Announcement */}
      {isBannerVisible && (
        <div className="bg-red-600 text-white w-full">
          <div className="flex items-center justify-between px-4 py-2">
            <button className="p-1 hover:bg-red-700 rounded">
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            
             <div className="flex-1 text-center text-sm font-medium">
               {headerFooterData.topHeaderText || 'Coats—every friday 75% Off. Shop Sale'}
             </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-red-700 rounded">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsBannerVisible(false)}
                className="p-1 hover:bg-red-700 rounded"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                {currentLogo && !logoLoading ? (
                  <img 
                    src={currentLogo}
                    alt={themeOptions.branding.logo_alt || siteInfo.name || 'Site Logo'}
                    className="h-8 w-auto max-w-[200px] object-contain"
                    onError={(e) => {
                      console.error('Logo failed to load:', currentLogo);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Logo loaded successfully:', currentLogo);
                    }}
                  />
                ) : null}
                <span 
                  className={`text-2xl font-bold text-gray-900 ${currentLogo && !logoLoading ? 'hidden' : 'block'}`}
                >
                  {logoLoading ? 'Loading...' : (siteInfo.name || themeOptions.branding.site_name || 'NextGen Ecommerce')}
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative group">
                  <Link 
                    href={item.href} 
                    className="flex items-center text-gray-700 hover:text-gray-900 font-normal py-2"
                    style={{ fontSize: '15px', fontWeight: 400 }}
                  >
                    {item.name}
                    {item.isHot && (
                      <span className="ml-1 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                        HOT
                      </span>
                    )}
                    {item.hasDropdown && (
                      <ChevronDownIcon className="ml-1 w-4 h-4" />
                    )}
                  </Link>
                  
                  {/* Dropdown Menu */}
                  {item.hasDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {item.dropdownItems ? (
                          // Custom dropdown items (for Shop menu)
                          item.dropdownItems.map((dropdownItem) => (
                            <Link 
                              key={dropdownItem.name}
                              href={dropdownItem.href} 
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {dropdownItem.name}
                            </Link>
                          ))
                        ) : (
                          // Default dropdown items (for other menus)
                          <>
                            <Link href={`${item.href.replace(/^\//, '')}/new`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              New Arrivals
                            </Link>
                            <Link href={`${item.href.replace(/^\//, '')}/popular`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Popular Items
                            </Link>
                            <Link href={`${item.href.replace(/^\//, '')}/trending`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Trending Now
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
            
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xs mx-4" ref={desktopSearchRef}>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    searchTerm && setShowSearchResults(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchTerm.trim()) {
                      e.preventDefault();
                      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
                      setShowSearchResults(false);
                    }
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <XIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
                
                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        Searching...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowSearchResults(false);
                              // Use router.push for better navigation
                              router.push(`/products/${product.id}`);
                            }}
                          >
                            <img
                              src={product.images?.[0]?.src || '/placeholder-product.svg'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                              <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
                            </div>
                          </Link>
                        ))}
                        <div className="border-t border-gray-200 p-3">
                          <Link
                            href={`/search?q=${encodeURIComponent(searchTerm)}`}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowSearchResults(false);
                              // Use router.push for better navigation
                              router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
                            }}
                          >
                            View all results →
                          </Link>
                        </div>
                      </div>
                    ) : searchTerm && (
                      <div className="p-4 text-center text-gray-500">
                        No products found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* User Icons */}
            <div className="flex items-center space-x-4">
              {/* User Profile with Dropdown */}

              <div className="relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <UserIcon className="w-6 h-6" />
                </button>
                
                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-2">
                      {profileItems.map((item) => {
                        const IconComponent = item.icon;
                        
                        // Handle header items (welcome message)
                        if (item.isHeader) {
                          return (
                            <div
                              key={item.name}
                              className="px-4 py-3 border-b border-gray-200"
                            >
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            </div>
                          );
                        }
                        
                        // Handle action items (like logout)
                        if (item.isAction) {
                          return (
                            <button
                              key={item.name}
                              onClick={() => {
                                item.action();
                                setIsProfileDropdownOpen(false);
                              }}
                              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                            >
                              <IconComponent className="w-5 h-5 mr-3 text-gray-500" />
                              {item.name}
                            </button>
                          );
                        }
                        
                        // Handle regular link items
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <IconComponent className="w-5 h-5 mr-3 text-gray-500" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Wishlist */}
              <Link href="/wishlist" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative">
                <HeartIcon className="w-6 h-6" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              
              {/* Shopping Cart */}
              <div className="relative" ref={cartDropdownRef}>
                <button 
                  onClick={() => setIsCartDropdownOpen(!isCartDropdownOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative"
                >
                  <ShoppingBagIcon className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
                
                {/* Cart Dropdown */}
                {isCartDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shopping Cart</h3>
                      
                      {cart.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                      ) : (
                        <>
                          <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                            {cart.map((item) => (
                              <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                <img 
                                  src={item.images?.[0]?.src || '/placeholder-product.svg'} 
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-900 truncate flex-1 mr-2">{item.name}</h4>
                                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{formatPrice((parseFloat(item.price || item.regular_price || 0)) * item.quantity)}</span>
                                  </div>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-lg font-semibold text-gray-900">Total:</span>
                              <span className="text-lg font-semibold text-gray-900">
                                {formatPrice(cart.reduce((total, item) => {
                                  const price = parseFloat(item.price || item.regular_price || 0);
                                  return total + (price * item.quantity);
                                }, 0))}
                              </span>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Link 
                                href="/cart"
                                className="flex-1 bg-gray-900 text-white text-center py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
                              >
                                View Cart
                              </Link>
                              <Link 
                                href="/checkout"
                                className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Checkout
                              </Link>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="md:hidden border-t border-gray-200 px-4 py-3" ref={mobileSearchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="I'm looking for..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm && setShowSearchResults(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm.trim()) {
                  e.preventDefault();
                  router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
                  setShowSearchResults(false);
                }
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <XIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
            
                {/* Mobile Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowSearchResults(false);
                          // Use router.push for better navigation
                          router.push(`/products/${product.id}`);
                        }}
                      >
                        <img
                          src={product.images?.[0]?.src || '/placeholder-product.svg'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                          <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-gray-200 p-3">
                      <Link
                        href={`/search?q=${encodeURIComponent(searchTerm)}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowSearchResults(false);
                          // Use router.push for better navigation
                          router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
                        }}
                      >
                        View all results →
                      </Link>
                    </div>
                  </div>
                ) : searchTerm && (
                  <div className="p-4 text-center text-gray-500">
                    No products found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="block px-3 py-2 font-normal text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    style={{ fontSize: '15px', fontWeight: 400 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center justify-between">
                      {item.name}
                      {item.isHot && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                          HOT
                        </span>
                      )}
                    </div>
                  </Link>
                  
                  {/* Mobile dropdown items for Shop menu */}
                  {item.name === 'Shop' && item.dropdownItems && (
                    <div className="ml-4 space-y-1">
                      {item.dropdownItems.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          href={dropdownItem.href}
                          className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {dropdownItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Mobile Authentication Links */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-200 mb-2">
                      Welcome, {user?.name || 'User'}
                    </div>
                    <Link
                      href="/account"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        openAuthModal('signin');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        openAuthModal('signup');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
