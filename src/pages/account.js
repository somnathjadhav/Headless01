import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWooCommerce } from '../context/WooCommerceContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useAddresses } from '../hooks/useAddresses';
import { useProfile } from '../hooks/useProfile';
import { useProfileSync } from '../hooks/useProfileSync';
import PasswordStrengthMeter from '../components/ui/PasswordStrengthMeter';
import PleaseSignIn from '../components/auth/PleaseSignIn';
import TwoFactorAuth from '../components/auth/TwoFactorAuth';
import SessionManagement from '../components/auth/SessionManagement';
import { changePasswordSchema, addressSchema, safeParseWithZod } from '../lib/zodSchemas';
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
  const { 
    addresses, 
    setAddresses,
    loading: addressesLoading, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress,
    syncAddressesToWordPress
  } = useAddresses();
  
  const { 
    profile, 
    loading: profileLoading, 
    updateProfile 
  } = useProfile();
  
  const { 
    isSyncing, 
    syncFromBackend, 
    syncToBackend, 
    transformBackendToFrontend 
  } = useProfileSync();
  
  // Real orders data from WooCommerce
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  // Order filtering state
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  
  // Order details modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Backend address state
  const [backendAddresses, setBackendAddresses] = useState([]);
  const [backendAddressesLoading, setBackendAddressesLoading] = useState(false);
  const [backendAddressesError, setBackendAddressesError] = useState(null);
  
  // User data - will be populated from profile API
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  // Sync formData with userData when userData changes
  useEffect(() => {
    setFormData(userData);
  }, [userData]);
  
  // Sync formData with profile when profile changes
  useEffect(() => {
    if (profile) {
      const updatedUserData = transformBackendToFrontend(profile);
      if (updatedUserData) {
        console.log('Profile data synced:', updatedUserData);
        setUserData(updatedUserData);
        setFormData(updatedUserData);
      }
    }
  }, [profile, transformBackendToFrontend]);
  
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

  // Address management is now handled by useAddresses hook
  
  // Function to fetch backend addresses
  const fetchBackendAddresses = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      setBackendAddressesLoading(true);
      setBackendAddressesError(null);
      
      const response = await fetch(`/api/addresses/backend?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setBackendAddresses(data.addresses);
        if (data.addresses.length > 0) {
          showSuccess(`Found ${data.addresses.length} backend address(es)`);
        } else {
          showInfo('No backend addresses found');
        }
      } else {
        setBackendAddressesError(data.message || 'Failed to fetch backend addresses');
        showError(data.message || 'Failed to fetch backend addresses');
      }
    } catch (error) {
      console.error('Error fetching backend addresses:', error);
      setBackendAddressesError('Failed to fetch backend addresses');
      showError('Failed to fetch backend addresses');
    } finally {
      setBackendAddressesLoading(false);
    }
  };
  
  const [newAddress, setNewAddress] = useState({
    type: 'shipping',
    name: '',
    company: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'IN',
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
  
  // Profile data is now managed by useProfile hook
  
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
    
    // Validate password fields using Zod
    const result = safeParseWithZod(changePasswordSchema, passwordData);
    if (!result.success) {
      setPasswordErrors(result.errors);
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
        return 'bg-gray-100 text-gray-800 border border-blue-200';
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

  const handleSave = async () => {
    try {
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || ''
      };
      
      // Try to update via the profile API first
      try {
        const success = await updateProfile(profileData);
        if (success) {
          setUserData(formData);
          setIsEditing(false);
          return;
        }
      } catch (updateError) {
        console.log('Profile update failed, trying sync to backend:', updateError);
      }
      
      // If profile update fails, try syncing to backend
      try {
        await syncToBackend(profileData);
        setUserData(formData);
        setIsEditing(false);
      } catch (syncError) {
        console.error('Both profile update and sync failed:', syncError);
        // Still update local state even if backend sync fails
        setUserData(formData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
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
  
  const handleAddAddress = async () => {
    // Check required fields only (name, street, city are required)
    if (newAddress.name && newAddress.street && newAddress.city) {
      const success = await addAddress(newAddress);
      if (success) {
        setNewAddress({
          type: 'shipping',
          name: '',
          company: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'IN',
          phone: ''
        });
        setIsAddingAddress(false);
      }
    } else {
      // Show error message for missing required fields
      showError('Please fill in all required fields (Name, Street Address, and City)');
    }
  };
  
  const handleDeleteAddress = async (addressId, addressType) => {
    await deleteAddress(addressId, addressType);
  };
  
  const handleSetDefaultAddress = async (addressId) => {
    await setDefaultAddress(addressId);
  };
  
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsEditingAddress(true);
    setIsAddingAddress(false); // Close add form if open
  };
  
  const handleUpdateAddress = async () => {
    // Check required fields only (name, street, city are required)
    if (editingAddress && editingAddress.name && editingAddress.street && editingAddress.city) {
      const success = await updateAddress(editingAddress.id, editingAddress);
      if (success) {
        setIsEditingAddress(false);
        setEditingAddress(null);
      }
    } else {
      // Show error message for missing required fields
      showError('Please fill in all required fields (Name, Street Address, and City)');
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditingAddress(false);
    setEditingAddress(null);
  };
  
  const syncTemporaryAddresses = async () => {
    try {
      await syncAddressesToWordPress(true); // Show notification for manual sync
    } catch (error) {
      console.error('Error syncing addresses:', error);
      showError('Failed to sync addresses');
    }
  };
  
  // Function to clear all addresses (useful for testing or user request)
  const clearAllAddresses = () => {
    setAddresses([]);
    // No longer using localStorage for address storage
    showSuccess('All addresses cleared');
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

  // Consistent styling constants
  const styles = {
    // Typography
    heading: {
      primary: 'text-xl font-medium text-gray-900',
      secondary: 'text-lg font-medium text-gray-900',
      tertiary: 'text-base font-medium text-gray-900',
      body: 'text-sm text-gray-600',
      caption: 'text-xs text-gray-500',
      label: 'text-sm font-medium text-gray-700'
    },
    // Spacing
    spacing: {
      section: 'mb-6',
      card: 'p-6',
      button: 'px-4 py-2',
      input: 'px-4 py-3',
      small: 'p-4',
      large: 'p-8'
    },
    // Colors
    colors: {
      primary: 'bg-black text-white',
      secondary: 'bg-gray-100 text-gray-700',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-gray-100 text-gray-800'
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Container with Boxed Layout */}
      <div className="max-w-7xl mx-auto bg-white min-h-screen shadow-2xl">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white relative">
          <div className="container mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
              <div className="relative">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-float">
                    <UserIcon className="w-8 h-8 text-white" />
                </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
          <div>
                  <h1 className="text-2xl font-medium mb-1">Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{userData.firstName || 'User'}!</span></h1>
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
              </div>
          </div>
        </div>
      </div>

        {/* Spacing between header and content */}
        <div className="h-4 bg-gray-50"></div>

        <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8 border border-gray-100" style={{borderRadius: '5px'}}>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-800 mb-2 text-center">Navigation</h3>
                <div className="w-full h-0.5 bg-black rounded-full"></div>
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
                          ? 'bg-black text-white shadow-md'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white bg-opacity-20'
                          : 'bg-gray-100 group-hover:bg-gray-100'
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
          <div className="lg:col-span-3 space-y-8">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-black p-6 text-white shadow-lg" style={{borderRadius: '5px'}}>
                  <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-medium mb-2">Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{userData.firstName || 'User'}!</span></h2>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Orders */}
                  <div className="group bg-white rounded-lg p-6 shadow-lg border border-gray-100 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{borderRadius: '5px'}}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Total Orders</p>
                        <p className="text-xl font-medium text-gray-900 mb-1">{orders.length}</p>
                        <p className="text-xs text-gray-500">All time</p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-black h-1.5 rounded-full w-0 transition-all duration-1000 group-hover:w-3/4"></div>
                      </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"></path>
                        </svg>
                    </div>
                    </div>
                  </div>

                  {/* Wishlist Items */}
                  <div className="group bg-white rounded-lg p-6 shadow-lg border border-gray-100 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{borderRadius: '5px'}}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Wishlist Items</p>
                        <p className="text-xl font-medium text-gray-900 mb-1">{wishlist.length}</p>
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
                  <div className="group bg-white rounded-lg p-6 shadow-lg border border-gray-100 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{borderRadius: '5px'}}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Saved Addresses</p>
                        <p className="text-xl font-medium text-gray-900 mb-1">{addresses.length}</p>
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
                  <div className="group bg-white rounded-lg p-6 shadow-lg border border-gray-100 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{borderRadius: '5px'}}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Account Status</p>
                        <p className="text-lg font-medium text-green-600 mb-1">Active</p>
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
                        <h3 className="text-base font-medium text-gray-900">Recent Orders</h3>
                        <Link
                          href="/orders"
                          className="text-sm text-black hover:text-gray-800 font-medium"
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
                                <p className="text-sm font-medium text-gray-900">₹{order.total}</p>
                                <span className={`px-3 py-1 text-xs font-medium rounded-lg ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'shipped' ? 'bg-gray-100 text-gray-800' :
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
                      <h3 className="text-base font-medium text-gray-900">Quick Actions</h3>
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
                      <h2 className="text-lg font-medium text-gray-900 mb-1">Profile Information</h2>
                      <p className="text-gray-600">Manage your personal information and preferences</p>
                    </div>
                  {!isEditing && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={syncFromBackend}
                        disabled={isSyncing}
                        className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Sync profile from backend"
                      >
                        {isSyncing ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>🔄</span>
                        )}
                        <span>Sync</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm shadow-sm"
                      >
                        <EditIcon className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    </div>
                  )}
                  </div>
                </div>

                <div className="p-8">

                {isEditing ? (
                  <div className="space-y-8">
                    {/* Personal Information Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-base font-medium text-gray-900 mb-6 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
                        Personal Information
                      </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                        </label>
                        <input
                            id="firstName"
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                            required
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-sm"
                            placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                        </label>
                        <input
                            id="lastName"
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                            required
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-sm"
                            placeholder="Enter your last name"
                        />
                        </div>
                      </div>
                      
                      {/* Company Field */}
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                          Company (optional)
                        </label>
                        <input
                          id="company"
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-sm"
                          placeholder="Enter your company name"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSave}
                        disabled={profileLoading}
                        className="flex-1 inline-flex items-center justify-center space-x-2 bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {profileLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 inline-flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                      >
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Personal Information Display */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-base font-medium text-gray-900 mb-6 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
                        Personal Information
                      </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <div className="block text-sm font-medium text-gray-500 mb-2">
                          First Name
                        </div>
                          <p className="text-base font-medium text-gray-900">{userData.firstName}</p>
                      </div>
                      <div>
                          <div className="block text-sm font-medium text-gray-500 mb-2">
                          Last Name
                        </div>
                          <p className="text-base font-medium text-gray-900">{userData.lastName}</p>
                        </div>
                      </div>
                      
                      {/* Company Display */}
                      {userData.company && (
                        <div>
                          <div className="block text-sm font-medium text-gray-500 mb-2">
                            Company
                          </div>
                          <p className="text-base font-medium text-gray-900">{userData.company}</p>
                        </div>
                      )}
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
                      <h2 className="text-lg font-medium text-gray-900 mb-1">Order History</h2>
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
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              orderFilter === 'all'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            All ({orders.length})
                          </button>
                          <button
                            onClick={() => setOrderFilter('processing')}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              orderFilter === 'processing'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Processing ({orders.filter(o => o.status === 'processing').length})
                          </button>
                          <button
                            onClick={() => setOrderFilter('shipped')}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              orderFilter === 'shipped'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Shipped ({orders.filter(o => o.status === 'shipped').length})
                          </button>
                          <button
                            onClick={() => setOrderFilter('completed')}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              orderFilter === 'completed'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Completed ({orders.filter(o => o.status === 'completed').length})
                          </button>
                          <button
                            onClick={() => setOrderFilter('cancelled')}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
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
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Orders</h3>
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
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
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
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
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
                        <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                          {/* Compact Order Header */}
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 text-xs font-medium rounded-lg ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'shipped' ? 'bg-gray-100 text-gray-800' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">Order #{order.number || order.id}</h4>
                                  <p className="text-xs text-gray-500">
                                    {new Date(order.date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">₹{order.total}</div>
                                <div className="text-xs text-gray-500">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</div>
                              </div>
                            </div>
                          </div>

                          {/* Compact Order Items */}
                          <div className="p-4">
                            <div className="space-y-2">
                              {order.items?.slice(0, 2).map((item, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                  <Link href={`/products/${item.slug || item.id}`} className="relative block flex-shrink-0">
                                    <div className="relative overflow-hidden rounded-lg bg-gray-50">
                                      <img
                                        src={item.image || '/placeholder-product.svg'}
                                alt={item.name}
                                        className="w-12 h-12 object-cover"
                                        onError={(e) => {
                                          e.target.src = '/placeholder-product.svg';
                                        }}
                                      />
                                      {item.quantity > 1 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                                          {item.quantity}
                                        </div>
                                      )}
                                    </div>
                                  </Link>
                                  <div className="flex-1 min-w-0">
                                    <Link 
                                      href={`/products/${item.slug || item.id}`}
                                      className="block"
                                    >
                                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1 hover:text-black transition-colors">
                                        {item.name}
                                      </h4>
                                    </Link>
                                    <p className="text-xs text-gray-500">
                                      {item.quantity} × ₹{item.price}
                                    </p>
                              </div>
                              <div className="text-right">
                                    <p className="font-medium text-gray-900 text-sm">₹{item.total}</p>
                              </div>
                            </div>
                          ))}
                              {order.items?.length > 2 && (
                                <div className="text-center py-2">
                                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                                    +{order.items.length - 2} more item{(order.items.length - 2) !== 1 ? 's' : ''}
                                  </span>
                        </div>
                              )}
                          </div>

                            {/* Compact Order Footer */}
                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                              <div className="flex items-center space-x-4 text-gray-500" style={{ fontSize: '11px' }}>
                                {order.paymentMethod && (
                                  <div className="flex items-center space-x-1">
                                    <CreditCardIcon className="w-3 h-3" />
                                    <span>{order.paymentMethod}</span>
                                  </div>
                                )}
                                {order.trackingNumber && (
                                  <div className="flex items-center space-x-1">
                                    <TruckIcon className="w-3 h-3" />
                                    <span>Track: {order.trackingNumber}</span>
                                  </div>
                                )}
                              </div>
                                <button
                                  onClick={() => openOrderModal(order)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors"
                                >
                                <EyeIcon className="w-3 h-3 mr-1" />
                                View Details
                                </button>
                            </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                    
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
              </div>
            )}

            {/* Enhanced Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Wishlist Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-1">My Wishlist</h2>
                      <p className="text-gray-600">Save products you love for later</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HeartIcon className="w-6 h-6 text-red-500" />
                      <span className="text-base font-medium text-gray-900">{wishlist.length} items</span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                {wishlist.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HeartIcon className="w-12 h-12 text-red-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
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
                                onError={(e) => {
                                  e.target.src = '/placeholder-product.svg';
                                }}
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
                              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                Sale
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-6">
                        <Link href={`/products/${item.id}`}>
                              <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-black transition-colors cursor-pointer text-sm">
                                {item.name}
                              </h4>
                        </Link>
                            
                            {/* Price */}
                            <div className="flex items-center space-x-2 mb-4">
                              {item.sale_price ? (
                                <>
                                  <span className="text-sm font-medium text-gray-900">
                                    ₹{parseFloat(item.sale_price).toFixed(2)}
                                  </span>
                                  <span className="text-xs text-gray-500 line-through">
                                    ₹{parseFloat(item.price || 0).toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-medium text-gray-900">
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
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">My Addresses</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your shipping and billing addresses</p>
                    {addresses.some(addr => addr.isTemporary && !addr.synced) && (
                      <div className="flex items-center mt-2 text-sm text-amber-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Some addresses are saved locally and will sync automatically
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={fetchBackendAddresses}
                      disabled={backendAddressesLoading}
                      className="inline-flex items-center px-3 py-2 rounded-lg font-medium text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      {backendAddressesLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                      ) : (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      Check Backend
                    </button>
                    {addresses.some(addr => addr.isTemporary && !addr.synced) && (
                      <button 
                        onClick={syncTemporaryAddresses}
                        className="inline-flex items-center px-3 py-2 rounded-lg font-medium text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sync Now
                      </button>
                    )}
                    <button 
                      onClick={() => setIsAddingAddress(!isAddingAddress)}
                      className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        isAddingAddress 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {isAddingAddress ? 'Cancel' : 'Add New Address'}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Add New Address Form */}
                  {isAddingAddress && (
                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <h3 className="text-base font-medium text-gray-900 mb-4">Add New Address</h3>
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
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
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
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <label htmlFor="addressCompany" className="block text-sm font-medium text-gray-700 mb-2">
                            Company (optional)
                          </label>
                          <input
                            id="addressCompany"
                            type="text"
                            name="company"
                            value={newAddress.company}
                            onChange={handleAddressInputChange}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Enter company name"
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
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Enter phone number"
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
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
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
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Enter city"
                          />
                        </div>
                        <div>
                          <label htmlFor="addressState" className="block text-sm font-medium text-gray-700 mb-2">
                            State/Province
                          </label>
                          <select
                            id="addressState"
                            name="state"
                            value={newAddress.state}
                            onChange={handleAddressInputChange}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                          >
                            <option value="">Select State</option>
                            <option value="AN">Andaman and Nicobar Islands</option>
                            <option value="AP">Andhra Pradesh</option>
                            <option value="AR">Arunachal Pradesh</option>
                            <option value="AS">Assam</option>
                            <option value="BR">Bihar</option>
                            <option value="CH">Chandigarh</option>
                            <option value="CT">Chhattisgarh</option>
                            <option value="DN">Dadra and Nagar Haveli</option>
                            <option value="DD">Daman and Diu</option>
                            <option value="DL">Delhi</option>
                            <option value="GA">Goa</option>
                            <option value="GJ">Gujarat</option>
                            <option value="HR">Haryana</option>
                            <option value="HP">Himachal Pradesh</option>
                            <option value="JK">Jammu and Kashmir</option>
                            <option value="JH">Jharkhand</option>
                            <option value="KA">Karnataka</option>
                            <option value="KL">Kerala</option>
                            <option value="LD">Lakshadweep</option>
                            <option value="MP">Madhya Pradesh</option>
                            <option value="MH">Maharashtra</option>
                            <option value="MN">Manipur</option>
                            <option value="ML">Meghalaya</option>
                            <option value="MZ">Mizoram</option>
                            <option value="NL">Nagaland</option>
                            <option value="OR">Odisha</option>
                            <option value="PY">Puducherry</option>
                            <option value="PB">Punjab</option>
                            <option value="RJ">Rajasthan</option>
                            <option value="SK">Sikkim</option>
                            <option value="TN">Tamil Nadu</option>
                            <option value="TG">Telangana</option>
                            <option value="TR">Tripura</option>
                            <option value="UP">Uttar Pradesh</option>
                            <option value="UT">Uttarakhand</option>
                            <option value="WB">West Bengal</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="addressZipCode" className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP/Postal Code
                          </label>
                          <input
                            id="addressZipCode"
                            type="text"
                            name="zipCode"
                            value={newAddress.zipCode || ''}
                            onChange={handleAddressInputChange}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Enter ZIP code"
                          />
                        </div>
                        <div>
                          <label htmlFor="addressCountry" className="block text-sm font-medium text-gray-700 mb-2">
                            Country/Region
                          </label>
                          <select
                            id="addressCountry"
                            name="country"
                            value={newAddress.country}
                            onChange={handleAddressInputChange}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                          >
                            <option value="IN">India</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="GB">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="JP">Japan</option>
                            <option value="CN">China</option>
                            <option value="BR">Brazil</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="addressCompany" className="block text-sm font-medium text-gray-700 mb-2">
                            Company (optional)
                          </label>
                          <input
                            id="addressCompany"
                            type="text"
                            name="company"
                            value={newAddress.company}
                            onChange={handleAddressInputChange}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Enter company name"
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
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
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

                  {/* Edit Address Form */}
                  {isEditingAddress && editingAddress && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Address</h3>
                      {(!editingAddress.street && !editingAddress.city && !editingAddress.state && !editingAddress.zipCode) && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>Note:</strong> This address appears to be incomplete. Please fill in the missing information below.
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="editAddressType" className="block text-sm font-medium text-gray-700 mb-2">
                            Address Type
                          </label>
                          <select
                            id="editAddressType"
                            name="type"
                            value={editingAddress.type}
                            onChange={(e) => setEditingAddress({...editingAddress, type: e.target.value})}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                          >
                            <option value="shipping">Shipping Address</option>
                            <option value="billing">Billing Address</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="editAddressName" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            id="editAddressName"
                            type="text"
                            name="name"
                            value={editingAddress.name}
                            onChange={(e) => setEditingAddress({...editingAddress, name: e.target.value})}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <label htmlFor="editAddressCompany" className="block text-sm font-medium text-gray-700 mb-2">
                            Company (optional)
                          </label>
                          <input
                            id="editAddressCompany"
                            type="text"
                            name="company"
                            value={editingAddress.company || ''}
                            onChange={(e) => setEditingAddress({...editingAddress, company: e.target.value})}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Enter company name"
                          />
                        </div>
                        <div>
                          <label htmlFor="editAddressPhone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            id="editAddressPhone"
                            type="tel"
                            name="phone"
                            value={editingAddress.phone}
                            onChange={(e) => setEditingAddress({...editingAddress, phone: e.target.value})}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="editAddressStreet" className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            id="editAddressStreet"
                            type="text"
                            name="street"
                            value={editingAddress.street}
                            onChange={(e) => setEditingAddress({...editingAddress, street: e.target.value})}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Enter street address"
                          />
                        </div>
                        <div>
                          <label htmlFor="editAddressCity" className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            id="editAddressCity"
                            type="text"
                            name="city"
                            value={editingAddress.city}
                            onChange={(e) => setEditingAddress({...editingAddress, city: e.target.value})}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Enter city"
                          />
                        </div>
                        <div>
                          <label htmlFor="editAddressState" className="block text-sm font-medium text-gray-700 mb-2">
                            State/Province
                          </label>
                          <select
                            id="editAddressState"
                            name="state"
                            value={editingAddress.state || ''}
                            onChange={(e) => setEditingAddress({...editingAddress, state: e.target.value})}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                          >
                            <option value="">Select State</option>
                            <option value="AN">Andaman and Nicobar Islands</option>
                            <option value="AP">Andhra Pradesh</option>
                            <option value="AR">Arunachal Pradesh</option>
                            <option value="AS">Assam</option>
                            <option value="BR">Bihar</option>
                            <option value="CH">Chandigarh</option>
                            <option value="CT">Chhattisgarh</option>
                            <option value="DN">Dadra and Nagar Haveli</option>
                            <option value="DD">Daman and Diu</option>
                            <option value="DL">Delhi</option>
                            <option value="GA">Goa</option>
                            <option value="GJ">Gujarat</option>
                            <option value="HR">Haryana</option>
                            <option value="HP">Himachal Pradesh</option>
                            <option value="JK">Jammu and Kashmir</option>
                            <option value="JH">Jharkhand</option>
                            <option value="KA">Karnataka</option>
                            <option value="KL">Kerala</option>
                            <option value="LD">Lakshadweep</option>
                            <option value="MP">Madhya Pradesh</option>
                            <option value="MH">Maharashtra</option>
                            <option value="MN">Manipur</option>
                            <option value="ML">Meghalaya</option>
                            <option value="MZ">Mizoram</option>
                            <option value="NL">Nagaland</option>
                            <option value="OR">Odisha</option>
                            <option value="PY">Puducherry</option>
                            <option value="PB">Punjab</option>
                            <option value="RJ">Rajasthan</option>
                            <option value="SK">Sikkim</option>
                            <option value="TN">Tamil Nadu</option>
                            <option value="TG">Telangana</option>
                            <option value="TR">Tripura</option>
                            <option value="UP">Uttar Pradesh</option>
                            <option value="UT">Uttarakhand</option>
                            <option value="WB">West Bengal</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="editAddressZipCode" className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP/Postal Code
                          </label>
                          <input
                            id="editAddressZipCode"
                            type="text"
                            name="zipCode"
                            value={editingAddress.zipCode || ''}
                            onChange={(e) => setEditingAddress({...editingAddress, zipCode: e.target.value})}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Enter ZIP code"
                          />
                        </div>
                        <div>
                          <label htmlFor="editAddressCountry" className="block text-sm font-medium text-gray-700 mb-2">
                            Country/Region
                          </label>
                          <select
                            id="editAddressCountry"
                            name="country"
                            value={editingAddress.country || 'IN'}
                            onChange={(e) => setEditingAddress({...editingAddress, country: e.target.value})}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                          >
                            <option value="IN">India</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="GB">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="JP">Japan</option>
                            <option value="CN">China</option>
                            <option value="BR">Brazil</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex space-x-3 mt-6">
                        <button
                          onClick={handleUpdateAddress}
                          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Update Address
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Display Existing Addresses */}
                  {!isEditingAddress && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((address) => (
                        <div key={address.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                          {/* Gradient background overlay */}
                          <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${
                            address.type === 'shipping' 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                              : 'bg-gradient-to-br from-purple-500 to-purple-600'
                          }`}></div>
                          
                          {/* Header with icon and actions */}
                          <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                                address.type === 'shipping' 
                                  ? 'bg-gradient-to-br from-blue-100 to-blue-200' 
                                  : 'bg-gradient-to-br from-purple-100 to-purple-200'
                              }`}>
                                <MapPinIcon className={`w-6 h-6 ${
                                  address.type === 'shipping' 
                                    ? 'text-blue-600' 
                                    : 'text-purple-600'
                                }`} />
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-gray-900 mb-1">
                                  {address.type === 'shipping' ? 'Shipping Address' : 'Billing Address'}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  {address.isDefault && (
                                    <div className="flex items-center space-x-1">
                                      <CheckIcon className="w-3 h-3 text-green-600" />
                                      <span className="text-xs text-green-600 font-medium">✓ Default Address</span>
                                    </div>
                                  )}
                                  {address.isTemporary && !address.synced && (
                                    <div className="flex items-center space-x-1">
                                      <svg className="w-3 h-3 text-amber-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-xs text-amber-600 font-medium">Syncing...</span>
                                    </div>
                                  )}
                                  {(!address.street && !address.city && !address.state && !address.zipCode && !address.country) && (
                                    <div className="flex items-center space-x-1">
                                      <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                      <span className="text-xs text-amber-600 font-medium">Incomplete</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex items-center space-x-1">
                              <button 
                                onClick={() => handleEditAddress(address)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-sm border border-blue-200"
                                title="Edit address"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                                  address.isDefault 
                                    ? 'bg-green-50 text-green-700 cursor-default border border-green-200' 
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm border border-gray-200'
                                }`}
                                disabled={address.isDefault}
                              >
                                {address.isDefault ? 'Default' : 'Set Default'}
                              </button>
                              <button 
                                onClick={() => handleDeleteAddress(address.id, address.type)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-sm"
                                title="Delete address"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Address details */}
                          <div className="space-y-3 mb-4 relative z-10">
                            {/* Name */}
                            <div className="flex items-center space-x-2">
                              <UserIcon className="w-4 h-4 text-gray-500" />
                              <p className="address-card-text font-medium text-gray-900">{address.name}</p>
                            </div>
                            
                            {/* Company */}
                            {address.company && (
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <p className="address-card-text text-gray-600">{address.company}</p>
                              </div>
                            )}
                            
                            {/* Address */}
                            <div className="flex items-start space-x-2">
                              <MapPinIcon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="address-card-text text-gray-600">
                                {(!address.street && !address.city && !address.state && !address.zipCode && !address.country) ? (
                                  <div className="text-amber-600 font-medium">Address information incomplete - Click Edit to complete</div>
                                ) : (
                                  <>
                                    <div>{address.street}</div>
                                    <div>{address.city}, {address.state} {address.zipCode}</div>
                                    <div>{address.country}</div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Phone */}
                            {address.phone && (
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <p className="address-card-text text-gray-600 font-medium">{address.phone}</p>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          <div className="flex items-center space-x-2 relative z-10">
                            {address.isDefault && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                <CheckIcon className="w-3 h-3 mr-1" />
                                Default
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              address.type === 'shipping' 
                                ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                : 'bg-purple-100 text-purple-800 border-purple-200'
                            }`}>
                              {address.type === 'shipping' ? 'Shipping' : 'Billing'}
                            </span>
                          </div>
                      </div>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {addresses.length === 0 && !isAddingAddress && !isEditingAddress && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MapPinIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses yet</h3>
                      <p className="text-gray-500 mb-6 max-w-sm mx-auto">Add your shipping and billing addresses to make checkout faster and easier.</p>
                      <button 
                        onClick={() => setIsAddingAddress(true)}
                        className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Your First Address
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <h2 className="text-xl font-medium text-gray-900 mb-6">Payment Methods</h2>
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Settings Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-1">Account Settings</h2>
                      <p className="text-gray-600">Manage your account preferences and notifications</p>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Notification Settings */}
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7h6m-6 4h6m-6 4h6M9 3v1m6 0v1M9 19v1m6 0v1" />
                      </svg>
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                            <p className="text-xs text-gray-500">Receive updates about orders and promotions</p>
                          </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked aria-label="Email notifications toggle" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                    <div>
                            <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                            <p className="text-xs text-gray-500">Receive order updates via text message</p>
                          </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" aria-label="SMS notifications toggle" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7h6m-6 4h6m-6 4h6M9 3v1m6 0v1M9 19v1m6 0v1" />
                            </svg>
                          </div>
                    <div>
                            <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                            <p className="text-xs text-gray-500">Get instant updates on your device</p>
                    </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked aria-label="Push notifications toggle" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Privacy & Security
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <ShieldIcon className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                            <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                          </div>
                        </div>
                        <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                      Enable
                    </button>
                  </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Login Alerts</h4>
                            <p className="text-xs text-gray-500">Get notified when someone logs into your account</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked aria-label="Login alerts toggle" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Account Preferences */}
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Account Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Language</h4>
                            <p className="text-xs text-gray-500">English (US)</p>
                          </div>
                        </div>
                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                          Change
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Theme</h4>
                            <p className="text-xs text-gray-500">Light mode</p>
                          </div>
                        </div>
                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                          Change
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Data Export</h4>
                            <p className="text-xs text-gray-500">Download a copy of your account data</p>
                          </div>
                        </div>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                          Request Export
                        </button>
                      </div>
                    </div>
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
                      <h2 className="text-lg font-medium text-gray-900 mb-1">Security Settings</h2>
                      <p className="text-gray-600">Manage your account security and privacy</p>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <ShieldIcon className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Password Security */}
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-6 flex items-center">
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
                            <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                      <div>
                            <p className="font-medium text-sm">
                              {passwordMessage.type === 'success' ? 'Success!' : 'Error'}
                            </p>
                            <p className="text-xs mt-1">{passwordMessage.text}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <form onSubmit={handlePasswordSubmit} className="max-w-4xl">
                        {/* Current Password - Full Width */}
                        <div className="mb-4">
                          <label htmlFor="currentPassword" className="block text-xs font-medium text-gray-700 mb-1">
                          Current Password *
                        </label>
                          <div className="relative">
                        <input
                          id="currentPassword"
                              type={showPasswords.current ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                              className={`w-full px-2.5 py-1.5 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-sm ${
                                passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                              }`}
                          placeholder="Enter your current password"
                        />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => togglePasswordVisibility('current')}
                            >
                              {showPasswords.current ? (
                                <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                              ) : (
                                <EyeIcon className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                      </div>
                          {passwordErrors.currentPassword && (
                            <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword}</p>
                          )}
                        </div>

                        {/* New Password and Confirm Password - Two Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                            <label htmlFor="newPassword" className="block text-xs font-medium text-gray-700 mb-1">
                          New Password *
                        </label>
                            <div className="relative">
                        <input
                          id="newPassword"
                                type={showPasswords.new ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                className={`w-full px-2.5 py-1.5 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-sm ${
                                  passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                                }`}
                          placeholder="Enter your new password"
                        />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => togglePasswordVisibility('new')}
                              >
                                {showPasswords.new ? (
                                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <EyeIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                        </div>
                            {passwordErrors.newPassword && (
                              <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword}</p>
                            )}
                      </div>
                          
                      <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                          Confirm New Password *
                        </label>
                            <div className="relative">
                        <input
                          id="confirmPassword"
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                className={`w-full px-2.5 py-1.5 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-sm ${
                                  passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                }`}
                          placeholder="Confirm your new password"
                        />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => togglePasswordVisibility('confirm')}
                              >
                                {showPasswords.confirm ? (
                                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <EyeIcon className="h-4 w-4 text-gray-400" />
                                )}
                      </button>
                            </div>
                            {passwordErrors.confirmPassword && (
                              <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword}</p>
                            )}
                    </div>
                  </div>

                        {/* Password Strength Meter - Full Width */}
                        <div className="mb-4">
                          <PasswordStrengthMeter password={passwordData.newPassword} />
                      </div>

                        {/* Update Button */}
                        <button type="submit" className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">
                          <ShieldIcon className="w-4 h-4" />
                          <span>Update Password</span>
                      </button>
                      </form>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <TwoFactorAuth 
                    isEnabled={is2FAEnabled} 
                    onToggle={setIs2FAEnabled} 
                  />

                  {/* Login Sessions */}
                  <SessionManagement />

                  {/* Privacy Settings */}
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Privacy & Data
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Data Export</h4>
                            <p className="text-xs text-gray-500">Download a copy of your account data</p>
                        </div>
                        </div>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                          Request Export
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Account Deletion</h4>
                            <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
                        </div>
                        </div>
                        <button className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm">
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
                      <h2 className="text-2xl font-medium text-gray-900">Order Details</h2>
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
                      <div className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${getStatusColor(selectedOrder.status)}`}>
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
                      <div className="text-3xl font-medium text-gray-900">₹{selectedOrder.total.toFixed(2)}</div>
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
                      <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-medium text-gray-900">{selectedOrder.paymentMethod || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Payment Status</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                          Paid
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MapPinIcon className="w-5 h-5 text-black" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
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
                            onError={(e) => {
                              e.target.src = '/placeholder-product.svg';
                            }}
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.slug || item.id}`}>
                            <h4 className="font-medium text-gray-900 hover:text-black transition-colors cursor-pointer truncate">
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
                          <div className="font-medium text-sm text-gray-900">₹{item.total.toFixed(2)}</div>
                          {selectedOrder.status === 'completed' && (
                            <Link
                              href={`/products/${item.slug || item.id}?review=true&orderId=${selectedOrder.id}#review-form`}
                              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center space-x-1"
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
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <TruckIcon className="w-5 h-5 text-black" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Tracking Information</h3>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-black font-medium">Tracking Number</div>
                          <div className="text-lg font-mono font-medium text-gray-900">{selectedOrder.trackingNumber}</div>
                        </div>
                        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
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
      
      {/* Spacing before footer */}
      <div className="h-4 bg-gray-50"></div>
      
      </div>
    </div>
  );
}
