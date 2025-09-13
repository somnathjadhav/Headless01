import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWooCommerce } from '../context/WooCommerceContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import PasswordStrengthMeter from '../components/ui/PasswordStrengthMeter';
import PleaseSignIn from '../components/auth/PleaseSignIn';
import TwoFactorAuth from '../components/auth/TwoFactorAuth';
import SessionManagement from '../components/auth/SessionManagement';
import { 
  UserIcon, 
  EditIcon, 
  ShieldIcon, 
  CreditCardIcon,
  TruckIcon,
  HeartIcon,
  MapPinIcon,
  ExclamationIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  ClockIcon
} from '../components/icons';

export default function Account() {
  const { wishlist, addToCart, removeFromWishlist } = useWooCommerce();
  const { isAuthenticated, user, isInitializing } = useAuth();
  const { showSuccess, showError, showInfo } = useNotifications();
  
  // Real orders data from WooCommerce
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  
  // Order filtering state
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  
  // Order details modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // User data from authentication context
  const [userData, setUserData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const [formData, setFormData] = useState(userData);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Share product function
  const shareProduct = async (product) => {
    const shareData = {
      title: product.name,
      text: `Check out this product: ${product.name}`,
      url: `${window.location.origin}/products/${product.id}`
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        // Use native Web Share API if available
        await navigator.share(shareData);
        showSuccess('Product shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        showSuccess('Product link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing product:', error);
      // Final fallback: show URL in alert
      const fallbackUrl = shareData.url;
      if (window.prompt('Copy this link to share:', fallbackUrl)) {
        showSuccess('Product link ready to share!');
      }
    }
  };

  // Address management state
  const [addresses, setAddresses] = useState([]);
  
  const [newAddress, setNewAddress] = useState({
    type: 'shipping',
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  });

  // Authentication guard - redirect if not authenticated
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      window.location.href = '/signin?redirect=account';
    }
  }, [isAuthenticated, isInitializing]);

  // Fetch real orders when orders tab is active
  useEffect(() => {
    const fetchOrders = async () => {
      if (activeTab === 'orders' && isAuthenticated && user?.id) {
        try {
          setOrdersLoading(true);
          setOrdersError(null);
          
          const response = await fetch(`/api/user-orders?userId=${user.id}`);
          const data = await response.json();
          
          if (data.success) {
            setOrders(data.orders);
          } else {
            setOrdersError(data.message || 'Failed to fetch orders');
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
          setOrdersError('Failed to fetch orders. Please try again.');
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    fetchOrders();
  }, [activeTab, isAuthenticated, user?.id]);

  // Fetch user profile data when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const response = await fetch(`/api/user-profile?userId=${user.id}`);
          const data = await response.json();
          
          if (data.success && data.profile) {
            const profile = data.profile;
            const updatedUserData = {
              firstName: profile.first_name || profile.name?.split(' ')[0] || '',
              lastName: profile.last_name || profile.name?.split(' ').slice(1).join(' ') || '',
              email: profile.email || user.email || '',
              phone: profile.billing?.phone || '',
              address: profile.billing?.address_1 || '',
              city: profile.billing?.city || '',
              state: profile.billing?.state || '',
              zipCode: profile.billing?.postcode || '',
              country: profile.billing?.country || ''
            };
            
            setUserData(updatedUserData);
            setFormData(updatedUserData);
            
            // Set up addresses from profile data
            const userAddresses = [];
            
            // Add shipping address if available
            if (profile.shipping && (profile.shipping.address_1 || profile.shipping.city)) {
              userAddresses.push({
                id: 1,
                type: 'shipping',
                isDefault: true,
                name: `${profile.shipping.first_name || ''} ${profile.shipping.last_name || ''}`.trim(),
                street: profile.shipping.address_1 || '',
                city: profile.shipping.city || '',
                state: profile.shipping.state || '',
                zipCode: profile.shipping.postcode || '',
                country: profile.shipping.country || '',
                phone: profile.billing?.phone || ''
              });
            }
            
            // Add billing address if available
            if (profile.billing && (profile.billing.address_1 || profile.billing.city)) {
              userAddresses.push({
                id: 2,
                type: 'billing',
                isDefault: false,
                name: `${profile.billing.first_name || ''} ${profile.billing.last_name || ''}`.trim(),
                street: profile.billing.address_1 || '',
                city: profile.billing.city || '',
                state: profile.billing.state || '',
                zipCode: profile.billing.postcode || '',
                country: profile.billing.country || '',
                phone: profile.billing.phone || ''
              });
            }
            
            setAddresses(userAddresses);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, user]);

  // Show loading while checking authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <PleaseSignIn 
        title="Access Your Account"
        message="Please sign in to view and manage your account settings, order history, and personal information."
        redirectTo="account"
      />
    );
  }
  
  // Password input handlers
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Password change submission handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors and messages
    setPasswordErrors({});
    setPasswordMessage({ type: '', text: '' });
    
    // Validate password fields
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Please enter your current password';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'Please enter a new password';
    } else {
      // Enhanced password validation
      if (passwordData.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters long';
      } else {
        const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
        const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
        const hasNumbers = /\d/.test(passwordData.newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
          errors.newPassword = 'Password must contain uppercase, lowercase, number, and special character';
        }
      }
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'New passwords do not match';
    }
    
    // If there are validation errors, show them and return
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      setPasswordMessage({ type: 'error', text: 'Please fix the errors below' });
      return;
    }

    try {
      console.log('Updating password...');
      console.log('User object:', user);
      console.log('User ID:', user?.id);
      
      // Make API call to update password
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          userId: user?.id,
          userEmail: user?.email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          setPasswordErrors({
            currentPassword: data.error || 'Current password is incorrect'
          });
          setPasswordMessage({ type: 'error', text: 'Current password is incorrect. Please check and try again.' });
        } else {
          throw new Error(data.error || 'Failed to update password');
        }
        return;
      }
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordMessage({ type: 'success', text: 'Password updated successfully! You can now use your new password to log in.' });
      
    } catch (error) {
      console.error('Password update error:', error);
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to update password. Please try again.' });
    }
  };

  // Filter orders based on status and search
  const filteredOrders = orders.filter(order => {
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    const matchesSearch = orderSearch === '' || 
      order.number?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.id?.toString().includes(orderSearch) ||
      order.items?.some(item => item.name.toLowerCase().includes(orderSearch.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Modal functions
  const openOrderModal = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  // Status helper functions (copied from orders page)
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckIcon className="w-4 h-4" />;
      case 'processing':
        return <ClockIcon className="w-4 h-4" />;
      case 'shipped':
        return <TruckIcon className="w-4 h-4" />;
      case 'cancelled':
        return <ExclamationIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setUserData(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };
  
  // Address management functions
  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddAddress = () => {
    if (newAddress.name && newAddress.street && newAddress.city && newAddress.state && newAddress.zipCode) {
      const addressToAdd = {
        ...newAddress,
        id: Date.now(),
        isDefault: addresses.length === 0
      };
      setAddresses(prev => [...prev, addressToAdd]);
      setNewAddress({
        type: 'shipping',
        name: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        phone: ''
      });
      setIsAddingAddress(false);
    }
  };
  
  const handleDeleteAddress = (addressId) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
  };
  
  const handleSetDefaultAddress = (addressId) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'orders', name: 'Orders', icon: TruckIcon },
    { id: 'wishlist', name: 'Wishlist', icon: HeartIcon },
    { id: 'addresses', name: 'My Addresses', icon: MapPinIcon },
    { id: 'payment', name: 'Payment', icon: CreditCardIcon },
    { id: 'settings', name: 'Settings', icon: EditIcon },
    { id: 'security', name: 'Security', icon: ShieldIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Container with Boxed Layout */}
      <div className="max-w-7xl mx-auto bg-white min-h-screen shadow-2xl">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white relative">
          <div className="container mx-auto px-6 pt-12 pb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-float">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold mb-1">Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{userData.firstName || 'User'}!</span></h1>
                  <p className="text-white text-opacity-90 text-sm">@{userData.firstName?.toLowerCase() || 'user'} • Member since {new Date().getFullYear()}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs">Online</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckIcon className="w-3 h-3" />
                      <span className="text-xs">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl px-4 py-2 mb-3 border border-white border-opacity-20">
                  <span className="text-xs font-medium">Active Member</span>
                </div>
                <div className="text-xs text-white text-opacity-90 space-y-1">
                  <div className="flex items-center justify-end space-x-2">
                    <span>{orders.length} Total Orders</span>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <span>{wishlist.length} Wishlist Items</span>
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <span>{addresses.length} Saved Addresses</span>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-5 sticky top-8 border border-gray-100" style={{borderRadius: '5px'}}>
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-800 mb-2 text-center">Navigation</h3>
                <div className="w-full h-0.5 bg-indigo-600 rounded-full"></div>
              </div>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        activeTab === tab.id
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white bg-opacity-20'
                          : 'bg-gray-100 group-hover:bg-indigo-100'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium">{tab.name}</span>
                        <div className={`text-xs ${
                          activeTab === tab.id
                            ? 'text-white text-opacity-80'
                            : 'text-gray-500'
                        }`}>
                          {tab.id === 'dashboard' ? 'Overview' : 
                           tab.id === 'profile' ? 'Personal info' :
                           tab.id === 'orders' ? 'Purchase history' :
                           tab.id === 'wishlist' ? 'Saved items' :
                           tab.id === 'addresses' ? 'Delivery info' :
                           tab.id === 'payment' ? 'Cards & billing' :
                           tab.id === 'settings' ? 'Preferences' :
                           tab.id === 'security' ? 'Privacy & safety' : ''}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-indigo-600 p-6 text-white shadow-lg" style={{borderRadius: '5px'}}>
                  <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{userData.firstName || 'User'}!</span></h2>
                      <p className="text-white text-opacity-90 text-sm mb-3">Here's what's happening with your account</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs">Account Active</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <span className="text-xs">Premium Member</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-float">
                        <UserIcon className="w-8 h-8" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Orders */}
                  <div className="group bg-white rounded-lg p-5 shadow-lg border border-gray-100 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{borderRadius: '5px'}}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Total Orders</p>
                        <p className="text-2xl font-semibold text-gray-900 mb-1">{orders.length}</p>
                        <p className="text-xs text-gray-500">All time</p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full w-0 transition-all duration-1000 group-hover:w-3/4"></div>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Wishlist Items */}
                  <div className="group bg-white rounded-lg p-5 shadow-lg border border-gray-100 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{borderRadius: '5px'}}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Wishlist Items</p>
                        <p className="text-2xl font-semibold text-gray-900 mb-1">{wishlist.length}</p>
                        <p className="text-xs text-gray-500">Saved for later</p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-pink-600 h-1.5 rounded-full w-3/4 transition-all duration-1000"></div>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HeartIcon className="w-6 h-6 text-pink-600" />
                      </div>
                    </div>
                  </div>

                  {/* Saved Addresses */}
                  <div className="group bg-white rounded-lg p-5 shadow-lg border border-gray-100 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{borderRadius: '5px'}}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Saved Addresses</p>
                        <p className="text-2xl font-semibold text-gray-900 mb-1">{addresses.length}</p>
                        <p className="text-xs text-gray-500">Ready to use</p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-600 h-1.5 rounded-full w-1/2 transition-all duration-1000"></div>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapPinIcon className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="group bg-white rounded-lg p-5 shadow-lg border border-gray-100 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{borderRadius: '5px'}}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Account Status</p>
                        <p className="text-xl font-semibold text-green-600 mb-1">Active</p>
                        <p className="text-xs text-gray-500">Verified member</p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-600 h-1.5 rounded-full w-full transition-all duration-1000"></div>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckIcon className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Orders */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                        <Link
                          href="/orders"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View All
                        </Link>
                      </div>
                    </div>
                    <div className="p-6">
                      {orders.length === 0 ? (
                        <div className="text-center py-8">
                          <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">No orders yet</p>
                          <Link
                            href="/products"
                            className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                          >
                            <span>Start Shopping</span>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.slice(0, 3).map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                              <div>
                                <p className="font-medium text-gray-900">Order #{order.number || order.id}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(order.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">₹{order.total}</p>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Link
                          href="/products"
                          className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-800 transition-colors">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-900">Browse Products</span>
                        </Link>
                        
                        <Link
                          href="/cart"
                          className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-800 transition-colors">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-900">View Cart</span>
                        </Link>
                        
                        <button
                          onClick={() => setActiveTab('profile')}
                          className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-800 transition-colors">
                            <EditIcon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">Edit Profile</span>
                        </button>
                        
                        <button
                          onClick={() => setActiveTab('addresses')}
                          className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-800 transition-colors">
                            <MapPinIcon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">Manage Addresses</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">Profile Information</h2>
                      <p className="text-gray-600">Manage your personal information and preferences</p>
                    </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                        className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-sm"
                    >
                        <EditIcon className="w-4 h-4" />
                        <span>Edit Profile</span>
                    </button>
                  )}
                  </div>
                </div>

                <div className="p-8">

                {isEditing ? (
                  <div className="space-y-8">
                    {/* Personal Information Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
                        Personal Information
                      </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                            First Name *
                        </label>
                        <input
                            id="firstName"
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                            placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                          <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                            Last Name *
                        </label>
                        <input
                            id="lastName"
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                            placeholder="Enter your last name"
                        />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address *
                      </label>
                      <input
                            id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                            placeholder="Enter your email address"
                      />
                    </div>
                    <div>
                          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                            id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                            placeholder="Enter your phone number"
                      />
                        </div>
                      </div>
                    </div>

                    {/* Address Information Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-2 text-gray-600" />
                        Address Information
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            id="address"
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                            placeholder="Enter your street address"
                          />
                        </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                              City
                            </label>
                            <input
                              id="city"
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                              placeholder="Enter city"
                            />
                          </div>
                          <div>
                            <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                              State/Province
                            </label>
                            <input
                              id="state"
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                              placeholder="Enter state"
                            />
                          </div>
                          <div>
                            <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-700 mb-2">
                              ZIP/Postal Code
                            </label>
                            <input
                              id="zipCode"
                              type="text"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                              placeholder="Enter ZIP code"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSave}
                        className="flex-1 inline-flex items-center justify-center space-x-2 bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-sm"
                      >
                        <CheckIcon className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 inline-flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                      >
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Personal Information Display */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
                        Personal Information
                      </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <div className="block text-sm font-medium text-gray-500 mb-2">
                          First Name
                        </div>
                          <p className="text-lg font-medium text-gray-900">{userData.firstName}</p>
                      </div>
                      <div>
                          <div className="block text-sm font-medium text-gray-500 mb-2">
                          Last Name
                        </div>
                          <p className="text-lg font-medium text-gray-900">{userData.lastName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Display */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Information
                      </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <div className="block text-sm font-medium text-gray-500 mb-2">
                          Email Address
                        </div>
                          <p className="text-lg font-medium text-gray-900">{userData.email}</p>
                      </div>
                      <div>
                          <div className="block text-sm font-medium text-gray-500 mb-2">
                          Phone Number
                        </div>
                          <p className="text-lg font-medium text-gray-900">{userData.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address Information Display */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-2 text-gray-600" />
                        Address Information
                      </h3>
                    <div>
                        <div className="block text-sm font-medium text-gray-500 mb-2">
                          Full Address
                      </div>
                        <div className="text-lg font-medium text-gray-900 space-y-1">
                          {userData.address && <p>{userData.address}</p>}
                          <p>
                            {userData.city && userData.state && userData.zipCode 
                              ? `${userData.city}, ${userData.state} ${userData.zipCode}`
                              : 'Address not complete'
                            }
                          </p>
                          <p>{userData.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">Order History</h2>
                      <p className="text-gray-600">Track and manage your recent orders</p>
                    </div>
                    <Link
                      href="/orders"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <TruckIcon className="w-4 h-4" />
                      <span>View All Orders</span>
                    </Link>
                  </div>
                </div>

                <div className="p-8">
                  {/* Search and Filter Controls */}
                  {orders.length > 0 && (
                    <div className="mb-8 space-y-4">
                      {/* Search Bar */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Search orders by number, ID, or product name..."
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>

                      {/* Filter Tabs and Clear Button */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setOrderFilter('all')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              orderFilter === 'all'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            All ({orders.length})
                          </button>
                          <button
                            onClick={() => setOrderFilter('processing')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              orderFilter === 'processing'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Processing ({orders.filter(o => o.status === 'processing').length})
                          </button>
                          <button
                            onClick={() => setOrderFilter('shipped')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              orderFilter === 'shipped'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Shipped ({orders.filter(o => o.status === 'shipped').length})
                          </button>
                          <button
                            onClick={() => setOrderFilter('completed')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              orderFilter === 'completed'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Completed ({orders.filter(o => o.status === 'completed').length})
                          </button>
                          <button
                            onClick={() => setOrderFilter('cancelled')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              orderFilter === 'cancelled'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Cancelled ({orders.filter(o => o.status === 'cancelled').length})
                          </button>
                        </div>
                        
                        {/* Clear Filters Button */}
                        {(orderFilter !== 'all' || orderSearch !== '') && (
                          <button
                            onClick={() => {
                              setOrderSearch('');
                              setOrderFilter('all');
                            }}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                
                {ordersLoading ? (
                    <div className="space-y-6">
                      {/* Skeleton Loading */}
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-gray-200 rounded-xl p-6 animate-pulse">
                          <div className="flex items-center justify-between mb-4">
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : ordersError ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ExclamationIcon className="w-10 h-10 text-red-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Orders</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">{ordersError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <ExclamationIcon className="w-4 h-4" />
                        <span>Try Again</span>
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <TruckIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        You haven&apos;t placed any orders yet. Start shopping to see your order history here.
                      </p>
                    <Link
                      href="/products"
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Start Shopping</span>
                    </Link>
                  </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        No orders match your current search or filter criteria.
                      </p>
                      <button
                        onClick={() => {
                          setOrderSearch('');
                          setOrderFilter('all');
                        }}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <span>Clear Filters</span>
                      </button>
                          </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="group bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 hover:-translate-y-1">
                          {/* Order Header */}
                          <div className="bg-gradient-to-r from-gray-50/50 to-white px-4 py-3 border-b border-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-2.5 h-2.5 rounded-full ${
                                    order.status === 'completed' ? 'bg-emerald-500' :
                                    order.status === 'processing' ? 'bg-amber-500' :
                                    order.status === 'shipped' ? 'bg-blue-500' :
                                    order.status === 'cancelled' ? 'bg-red-500' :
                                    'bg-gray-400'
                                  }`}></div>
                                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    order.status === 'processing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    order.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">Order #{order.number || order.id}</h4>
                                  <p className="text-sm text-gray-500 font-medium">
                                    {new Date(order.date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">₹{order.total}</div>
                                <div className="text-sm text-gray-500 font-medium">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</div>
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="p-4">
                            <div className="space-y-3">
                              {order.items?.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center space-x-3 group/item">
                                  <Link href={`/products/${item.slug || item.id}`} className="relative block">
                                    <div className="relative overflow-hidden rounded-xl bg-gray-50">
                                      <img
                                        src={item.image || '/placeholder-product.svg'}
                                alt={item.name}
                                        className="w-20 h-20 object-cover transition-transform duration-300 group-hover/item:scale-105"
                                      />
                                      {item.quantity > 1 && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                                          {item.quantity}
                                        </div>
                                      )}
                                    </div>
                                  </Link>
                                  <div className="flex-1 min-w-0">
                                    <Link 
                                      href={`/products/${item.slug || item.id}`}
                                      className="block group/title"
                                    >
                                      <h4 className="font-semibold text-gray-900 text-base line-clamp-2 group-hover/title:text-black transition-colors">
                                        {item.name}
                                      </h4>
                                    </Link>
                                    <p className="text-sm text-gray-500 font-medium mt-1">
                                      {item.quantity} × ₹{item.price}
                                    </p>
                              </div>
                              <div className="text-right">
                                    <p className="font-semibold text-gray-900 text-sm">₹{item.total}</p>
                              </div>
                            </div>
                          ))}
                              {order.items?.length > 3 && (
                                <div className="text-center py-3">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                                    +{order.items.length - 3} more item{(order.items.length - 3) !== 1 ? 's' : ''}
                                  </span>
                        </div>
                              )}
                          </div>

                            {/* Order Actions */}
                            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                              <div className="flex items-center space-x-6 text-sm">
                                {order.trackingNumber && (
                                  <div className="flex items-center space-x-2 text-gray-600">
                                    <TruckIcon className="w-4 h-4" />
                                    <span className="font-medium">Track: {order.trackingNumber}</span>
                                  </div>
                                )}
                                {order.paymentMethod && (
                                  <div className="flex items-center space-x-2 text-gray-600">
                                    <CreditCardIcon className="w-4 h-4" />
                                    <span className="font-medium">{order.paymentMethod}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-4">
                                {order.status === 'completed' && (
                                  <button 
                                    onClick={() => {
                                      // Add all items from this order to cart
                                      console.log('🔄 Reordering items from order:', order.id);
                                      let addedItems = 0;
                                      order.items?.forEach(item => {
                                        // Ensure the item has the required structure for addToCart
                                        const cartItem = {
                                          id: item.id || item.product_id,
                                          name: item.name,
                                          price: item.price,
                                          image: item.image,
                                          quantity: item.quantity
                                        };
                                        console.log('🛒 Adding to cart:', cartItem);
                                        addToCart(cartItem, item.quantity);
                                        addedItems += item.quantity;
                                      });
                                      
                                      // Show toaster message
                                      if (addedItems > 0) {
                                        // Create a simple toaster notification
                                        const toaster = document.createElement('div');
                                        toaster.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
                                        toaster.innerHTML = `
                                          <div class="flex items-center space-x-2">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            <span>${addedItems} item${addedItems !== 1 ? 's' : ''} added to cart!</span>
                                          </div>
                                        `;
                                        document.body.appendChild(toaster);
                                        
                                        // Remove toaster after 3 seconds
                                        setTimeout(() => {
                                          toaster.style.opacity = '0';
                                          toaster.style.transform = 'translateX(100%)';
                                          setTimeout(() => {
                                            document.body.removeChild(toaster);
                                          }, 300);
                                        }, 3000);
                                      }
                                    }}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200"
                                  >
                                    Reorder
                                  </button>
                                )}
                                <button
                                  onClick={() => openOrderModal(order)}
                                  className="inline-flex items-center space-x-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                  <span>View Details</span>
                                </button>
                              </div>
                            </div>
                        </div>
                      </div>
                    ))}
                    
                      {filteredOrders.length > 5 && (
                        <div className="text-center pt-6 border-t border-gray-100">
                        <Link
                          href="/orders"
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span>View All {filteredOrders.length} Orders</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                </div>
              </div>
            )}

            {/* Enhanced Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Wishlist Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">My Wishlist</h2>
                      <p className="text-gray-600">Save products you love for later</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HeartIcon className="w-6 h-6 text-red-500" />
                      <span className="text-lg font-semibold text-gray-900">{wishlist.length} items</span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                {wishlist.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HeartIcon className="w-12 h-12 text-red-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Start adding products you love to your wishlist. You can save items for later and get notified when prices drop.
                      </p>
                      <Link
                      href="/products"
                        className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Browse Products</span>
                      </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                        <div key={item.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 hover:-translate-y-1">
                          {/* Product Image */}
                          <div className="relative overflow-hidden">
                        <Link href={`/products/${item.id}`}>
                          <img
                            src={item.images?.[0]?.src || '/placeholder-product.svg'}
                            alt={item.name}
                                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          />
                        </Link>
                            {/* Wishlist Remove Button */}
                            <button 
                              className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                              onClick={() => {
                                removeFromWishlist(item.id);
                                showSuccess(`${item.name} removed from wishlist`);
                              }}
                              title="Remove from wishlist"
                            >
                              <HeartIcon className="w-4 h-4 text-red-500 fill-current" />
                            </button>
                            {/* Sale Badge */}
                            {item.sale_price && (
                              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                                Sale
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-6">
                        <Link href={`/products/${item.id}`}>
                              <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer text-sm">
                                {item.name}
                              </h4>
                        </Link>
                            
                            {/* Price */}
                            <div className="flex items-center space-x-2 mb-4">
                              {item.sale_price ? (
                                <>
                                  <span className="text-sm font-semibold text-gray-900">
                                    ₹{parseFloat(item.sale_price).toFixed(2)}
                                  </span>
                                  <span className="text-xs text-gray-500 line-through">
                                    ₹{parseFloat(item.price || 0).toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-semibold text-gray-900">
                                  ₹{parseFloat(item.price || 0).toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Rating */}
                            {item.average_rating && (
                              <div className="flex items-center space-x-1 mb-4">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < Math.floor(item.average_rating)
                                          ? 'text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  ({item.rating_count || 0})
                                </span>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex space-x-3">
                        <button 
                          onClick={() => addToCart(item, 1)}
                                className="flex-1 bg-black text-white py-2.5 px-4 rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm"
                        >
                          Add to Cart
                        </button>
                              <button 
                                className="px-3 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                onClick={() => shareProduct(item)}
                                title="Share this product"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
            )}



            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">My Addresses</h2>
                  <button 
                    onClick={() => setIsAddingAddress(!isAddingAddress)}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {isAddingAddress ? 'Cancel' : 'Add New Address'}
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Add New Address Form */}
                  {isAddingAddress && (
                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="addressType" className="block text-sm font-medium text-gray-700 mb-2">
                            Address Type
                          </label>
                          <select
                            id="addressType"
                            name="type"
                            value={newAddress.type}
                            onChange={handleAddressInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          >
                            <option value="shipping">Shipping Address</option>
                            <option value="billing">Billing Address</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="addressName" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            id="addressName"
                            type="text"
                            name="name"
                            value={newAddress.name}
                            onChange={handleAddressInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Enter full name"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="addressStreet" className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            id="addressStreet"
                            type="text"
                            name="street"
                            value={newAddress.street}
                            onChange={handleAddressInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Enter street address"
                          />
                        </div>
                        <div>
                          <label htmlFor="addressCity" className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            id="addressCity"
                            type="text"
                            name="city"
                            value={newAddress.city}
                            onChange={handleAddressInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Enter city"
                          />
                        </div>
                        <div>
                          <label htmlFor="addressState" className="block text-sm font-medium text-gray-700 mb-2">
                            State/Province
                          </label>
                          <input
                            id="addressState"
                            type="text"
                            name="state"
                            value={newAddress.state}
                            onChange={handleAddressInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Enter state"
                          />
                        </div>
                        <div>
                          <label htmlFor="addressZipCode" className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP/Postal Code
                          </label>
                          <input
                            id="addressZipCode"
                            type="text"
                            name="zipCode"
                            value={newAddress.zipCode}
                            onChange={handleAddressInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Enter ZIP code"
                          />
                        </div>
                        <div>
                          <label htmlFor="addressPhone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            id="addressPhone"
                            type="tel"
                            name="phone"
                            value={newAddress.phone}
                            onChange={handleAddressInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-3 mt-6">
                        <button
                          onClick={handleAddAddress}
                          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => setIsAddingAddress(false)}
                          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Display Existing Addresses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {address.type === 'shipping' ? 'Shipping Address' : 'Billing Address'}
                            {address.isDefault && <span className="ml-2 text-sm text-green-600">(Default)</span>}
                          </h3>
                          <div className="space-y-1 text-gray-600">
                            <p>{address.name}</p>
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.zipCode}</p>
                            <p>{address.country}</p>
                            {address.phone && <p>{address.phone}</p>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {address.isDefault ? 'Default' : 'Set Default'}
                          </button>
                          <button 
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {address.isDefault && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Default</span>
                        )}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          address.type === 'shipping' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {address.type === 'shipping' ? 'Shipping' : 'Billing'}
                        </span>
                      </div>
                    </div>
                  ))}
                  </div>

                  {/* Empty State */}
                  {addresses.length === 0 && !isAddingAddress && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPinIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                      <p className="text-gray-500 mb-4">Add your first address to get started</p>
                      <button 
                        onClick={() => setIsAddingAddress(true)}
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Add Address
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Methods</h2>
                <div className="text-center py-12">
                  <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods added</h3>
                  <p className="text-gray-500 mb-4">Add your preferred payment methods for faster checkout</p>
                  <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                    Add Payment Method
                  </button>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive updates about orders and promotions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked aria-label="Email notifications toggle" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                      <p className="text-sm text-gray-500">Receive order updates via text message</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" aria-label="SMS notifications toggle" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Security Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                  <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">Security Settings</h2>
                      <p className="text-gray-600">Manage your account security and privacy</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <ShieldIcon className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Password Security */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Password Security
                    </h3>
                    
                    {/* Prominent Password Message */}
                    {passwordMessage.text && (
                      <div className={`mb-6 p-4 rounded-lg border-2 ${
                        passwordMessage.type === 'success' 
                          ? 'bg-green-50 border-green-200 text-green-800' 
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        <div className="flex items-center">
                          {passwordMessage.type === 'success' ? (
                            <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <div>
                            <p className="font-semibold text-lg">
                              {passwordMessage.type === 'success' ? 'Success!' : 'Error'}
                            </p>
                            <p className="text-base mt-1">{passwordMessage.text}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-2xl">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                          Current Password *
                        </label>
                        <div className="relative">
                          <input
                            id="currentPassword"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                            className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                              passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter your current password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => togglePasswordVisibility('current')}
                          >
                            {showPasswords.current ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.currentPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            id="newPassword"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                            className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                              passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter your new password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => togglePasswordVisibility('new')}
                          >
                            {showPasswords.new ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                        )}
                        <PasswordStrengthMeter password={passwordData.newPassword} />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirm New Password *
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                            className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                              passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Confirm your new password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => togglePasswordVisibility('confirm')}
                          >
                            {showPasswords.confirm ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>
                      <button type="submit" className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium">
                        <ShieldIcon className="w-4 h-4" />
                        <span>Update Password</span>
                      </button>
                    </form>
                  </div>

                  {/* Two-Factor Authentication */}
                  <TwoFactorAuth 
                    isEnabled={is2FAEnabled} 
                    onToggle={setIs2FAEnabled} 
                  />

                  {/* Login Sessions */}
                  <SessionManagement />

                  {/* Privacy Settings */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Privacy & Data
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Data Export</p>
                          <p className="text-sm text-gray-600">Download a copy of your account data</p>
                        </div>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                          Request Export
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Account Deletion</p>
                          <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                        </div>
                        <button className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Enhanced Header */}
            <div className="relative bg-gradient-to-r from-gray-50 to-white p-8 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">Order Details</h2>
                      <p className="text-gray-600 mt-1">Order #{selectedOrder.id}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeOrderModal}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
              <div className="p-8 space-y-8">
                {/* Order Status & Summary */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-6 border border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span className="capitalize">{selectedOrder.status}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        {new Date(selectedOrder.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">₹{selectedOrder.total.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                    </div>
                  </div>
                </div>

                {/* Order Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CreditCardIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-medium text-gray-900">{selectedOrder.paymentMethod || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Payment Status</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Paid
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPinIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {selectedOrder.shipping?.address_1 && (
                        <div>{selectedOrder.shipping.address_1}</div>
                      )}
                      {selectedOrder.shipping?.address_2 && (
                        <div>{selectedOrder.shipping.address_2}</div>
                      )}
                      <div>
                        {selectedOrder.shipping?.city || 'N/A'}, {selectedOrder.shipping?.state || 'N/A'} {selectedOrder.shipping?.postcode || 'N/A'}
                      </div>
                      <div>{selectedOrder.shipping?.country || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {selectedOrder.items?.length || 0} item{(selectedOrder.items?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <Link href={`/products/${item.slug || item.id}`} className="flex-shrink-0">
                          <img
                            src={item.image || '/placeholder-product.svg'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.slug || item.id}`}>
                            <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer truncate">
                              {item.name}
                            </h4>
                          </Link>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col items-end space-y-2">
                          <div className="font-semibold text-sm text-gray-900">₹{item.total.toFixed(2)}</div>
                          {selectedOrder.status === 'completed' && (
                            <Link
                              href={`/products/${item.slug || item.id}?review=true&orderId=${selectedOrder.id}#review-form`}
                              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors font-medium flex items-center space-x-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              <span>Write Review</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking Information */}
                {selectedOrder.trackingNumber && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TruckIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-900">Tracking Information</h3>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-blue-600 font-medium">Tracking Number</div>
                          <div className="text-lg font-mono font-bold text-blue-900">{selectedOrder.trackingNumber}</div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Track Package
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeOrderModal}
                  className="flex-1 bg-black text-white py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors font-medium"
                >
                  Close
                </button>
                {selectedOrder.status === 'completed' && (
                  <button 
                    onClick={() => {
                      // Add all items from this order to cart
                      console.log('🔄 Reordering items from modal for order:', selectedOrder.id);
                      let addedItems = 0;
                      selectedOrder.items?.forEach(item => {
                        // Ensure the item has the required structure for addToCart
                        const cartItem = {
                          id: item.id || item.product_id,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          quantity: item.quantity
                        };
                        console.log('🛒 Adding to cart from modal:', cartItem);
                        addToCart(cartItem, item.quantity);
                        addedItems += item.quantity;
                      });
                      
                      // Show toaster message
                      if (addedItems > 0) {
                        // Create a simple toaster notification
                        const toaster = document.createElement('div');
                        toaster.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
                        toaster.innerHTML = `
                          <div class="flex items-center space-x-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>${addedItems} item${addedItems !== 1 ? 's' : ''} added to cart!</span>
                          </div>
                        `;
                        document.body.appendChild(toaster);
                        
                        // Remove toaster after 3 seconds
                        setTimeout(() => {
                          toaster.style.opacity = '0';
                          toaster.style.transform = 'translateX(100%)';
                          setTimeout(() => {
                            document.body.removeChild(toaster);
                          }, 300);
                        }, 3000);
                      }
                      
                      closeOrderModal();
                    }}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-colors font-medium"
                  >
                    Reorder Items
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
