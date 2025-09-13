import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWooCommerce } from '../context/WooCommerceContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useGlobalTypography } from '../hooks/useGlobalTypography';
import CouponInput from '../components/woocommerce/CouponInput';
import PleaseSignIn from '../components/auth/PleaseSignIn';
// import AddressSelector from '../components/checkout/AddressSelector';
// import AddressModal from '../components/checkout/AddressModal';
import { 
  CreditCardIcon, 
  TruckIcon, 
  CheckIcon,
  ExclamationIcon
} from '../components/icons';

export default function Checkout() {
  const router = useRouter();
  const { cart, cartTotal, appliedCoupon, clearCart, restoreCart, cartBackup } = useWooCommerce();
  const { isAuthenticated, user } = useAuth();
  const { formatPrice } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');
  
  // Address management state
  const [billingAddresses, setBillingAddresses] = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressModalType, setAddressModalType] = useState('billing');
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    company: '',
    country: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: user?.email || '',
    shipToDifferent: false,
    orderNotes: '',
    paymentMethod: 'cod',
    // Shipping address fields
    shippingFirstName: '',
    shippingLastName: '',
    shippingCompany: '',
    shippingCountry: '',
    shippingAddress1: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingState: '',
    shippingZipCode: ''
  });

  // Fetch user profile data and addresses when user is authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const response = await fetch(`/api/user-profile?userId=${user.id}`);
          const data = await response.json();
          
          if (data.success && data.profile) {
            const profile = data.profile;
            
            // Create address objects from profile data
            const billingAddress = {
              id: 'default-billing',
              nickname: 'Default Billing',
              first_name: profile.billing.first_name || profile.first_name,
              last_name: profile.billing.last_name || profile.last_name,
              company: profile.billing.company || profile.company,
              address_1: profile.billing.address_1,
              address_2: profile.billing.address_2,
              city: profile.billing.city,
              state: profile.billing.state,
              postcode: profile.billing.postcode,
              country: profile.billing.country,
              phone: profile.billing.phone || profile.phone,
              email: profile.billing.email || profile.email
            };

            const shippingAddress = {
              id: 'default-shipping',
              nickname: 'Default Shipping',
              first_name: profile.shipping.first_name || profile.first_name,
              last_name: profile.shipping.last_name || profile.last_name,
              company: profile.shipping.company || profile.company,
              address_1: profile.shipping.address_1,
              address_2: profile.shipping.address_2,
              city: profile.shipping.city,
              state: profile.shipping.state,
              postcode: profile.shipping.postcode,
              country: profile.shipping.country,
              phone: profile.shipping.phone || profile.phone,
              email: profile.shipping.email || profile.email
            };

            // Set addresses (filter out empty ones)
            const validBillingAddresses = [billingAddress].filter(addr => 
              addr.first_name && addr.last_name && addr.address_1 && addr.city
            );
            const validShippingAddresses = [shippingAddress].filter(addr => 
              addr.first_name && addr.last_name && addr.address_1 && addr.city
            );

            setBillingAddresses(validBillingAddresses);
            setShippingAddresses(validShippingAddresses);
            
            // Set selected addresses
            if (validBillingAddresses.length > 0) {
              setSelectedBillingAddress(validBillingAddresses[0]);
            }
            if (validShippingAddresses.length > 0) {
              setSelectedShippingAddress(validShippingAddresses[0]);
            }
            
            // Update form data with profile information
            setFormData(prev => ({
              ...prev,
              firstName: profile.billing.first_name || profile.first_name || prev.firstName,
              lastName: profile.billing.last_name || profile.last_name || prev.lastName,
              company: profile.billing.company || profile.company || prev.company,
              country: profile.billing.country || prev.country,
              address1: profile.billing.address_1 || prev.address1,
              address2: profile.billing.address_2 || prev.address2,
              city: profile.billing.city || prev.city,
              state: profile.billing.state || prev.state,
              zipCode: profile.billing.postcode || prev.zipCode,
              phone: profile.billing.phone || profile.phone || prev.phone,
              email: profile.billing.email || profile.email || prev.email,
              // Shipping address
              shippingFirstName: profile.shipping.first_name || profile.first_name || prev.shippingFirstName,
              shippingLastName: profile.shipping.last_name || profile.last_name || prev.shippingLastName,
              shippingCompany: profile.shipping.company || profile.company || prev.shippingCompany,
              shippingCountry: profile.shipping.country || prev.shippingCountry,
              shippingAddress1: profile.shipping.address_1 || prev.shippingAddress1,
              shippingAddress2: profile.shipping.address_2 || prev.shippingAddress2,
              shippingCity: profile.shipping.city || prev.shippingCity,
              shippingState: profile.shipping.state || prev.shippingState,
              shippingZipCode: profile.shipping.postcode || prev.shippingZipCode
            }));
            
            console.log('User profile data loaded:', profile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, user?.id]);

  // Apply global typography
  useGlobalTypography();

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        // Also set shipping fields to match billing initially
        shippingFirstName: user.name?.split(' ')[0] || '',
        shippingLastName: user.name?.split(' ').slice(1).join(' ') || ''
      }));
    }
  }, [user]);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=checkout');
    }
  }, [isAuthenticated, router]);

  // Redirect to products if cart is empty
  useEffect(() => {
    if (cart.length === 0 && isAuthenticated) {
      router.push('/products');
    }
  }, [cart, isAuthenticated, router]);

  // Calculate totals
  const subtotal = cart.reduce((total, item) => {
    const price = parseFloat(item.price || item.regular_price || 0);
    return total + (price * item.quantity);
  }, 0);
  
  // Calculate coupon discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percent') {
      couponDiscount = (subtotal * parseFloat(appliedCoupon.amount)) / 100;
    } else {
      couponDiscount = parseFloat(appliedCoupon.amount);
    }
  }
  
  const total = subtotal - couponDiscount;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // When "Ship to different address" is checked, copy billing address to shipping
    if (field === 'shipToDifferent' && value === true) {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        shippingFirstName: prev.firstName,
        shippingLastName: prev.lastName,
        shippingCompany: prev.company,
        shippingCountry: prev.country,
        shippingAddress1: prev.address1,
        shippingAddress2: prev.address2,
        shippingCity: prev.city,
        shippingState: prev.state,
        shippingZipCode: prev.zipCode
      }));
    }
  };

  // Address management functions
  const handleSelectBillingAddress = (address) => {
    setSelectedBillingAddress(address);
    // Update form data with selected address
    setFormData(prev => ({
      ...prev,
      firstName: address.first_name,
      lastName: address.last_name,
      company: address.company || '',
      country: address.country,
      address1: address.address_1,
      address2: address.address_2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.postcode,
      phone: address.phone || '',
      email: address.email
    }));
  };

  const handleSelectShippingAddress = (address) => {
    setSelectedShippingAddress(address);
    // Update form data with selected address
    setFormData(prev => ({
      ...prev,
      shippingFirstName: address.first_name,
      shippingLastName: address.last_name,
      shippingCompany: address.company || '',
      shippingCountry: address.country,
      shippingAddress1: address.address_1,
      shippingAddress2: address.address_2 || '',
      shippingCity: address.city,
      shippingState: address.state,
      shippingZipCode: address.postcode
    }));
  };

  const handleAddNewAddress = (type) => {
    setAddressModalType(type);
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (address, type) => {
    setAddressModalType(type);
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (addressData) => {
    try {
      // For now, we'll just add to local state
      // In a real implementation, you'd save to the backend
      const newAddress = {
        ...addressData,
        id: editingAddress?.id || `address-${Date.now()}`
      };

      if (addressModalType === 'billing') {
        const updatedAddresses = editingAddress 
          ? billingAddresses.map(addr => addr.id === editingAddress.id ? newAddress : addr)
          : [...billingAddresses, newAddress];
        setBillingAddresses(updatedAddresses);
        
        // Auto-select if it's the first address or if editing the selected one
        if (updatedAddresses.length === 1 || (editingAddress && selectedBillingAddress?.id === editingAddress.id)) {
          setSelectedBillingAddress(newAddress);
          handleSelectBillingAddress(newAddress);
        }
      } else {
        const updatedAddresses = editingAddress 
          ? shippingAddresses.map(addr => addr.id === editingAddress.id ? newAddress : addr)
          : [...shippingAddresses, newAddress];
        setShippingAddresses(updatedAddresses);
        
        // Auto-select if it's the first address or if editing the selected one
        if (updatedAddresses.length === 1 || (editingAddress && selectedShippingAddress?.id === editingAddress.id)) {
          setSelectedShippingAddress(newAddress);
          handleSelectShippingAddress(newAddress);
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to place an order');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    // Check if we have valid line items
    const validLineItems = cart.filter(item => {
      const price = parseFloat(item.price || item.regular_price || 0);
      return item.id && item.quantity && price > 0;
    });
    if (validLineItems.length === 0) {
      setError('No valid products in cart. Please check product prices and try again.');
      return;
    }

    // Form validation
    if (!formData.firstName || !formData.lastName || !formData.address1 || 
        !formData.city || !formData.state || !formData.zipCode || !formData.email) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    // Shipping address validation when enabled
    if (formData.shipToDifferent) {
      if (!formData.shippingFirstName || !formData.shippingLastName || !formData.shippingAddress1 || 
          !formData.shippingCity || !formData.shippingState || !formData.shippingZipCode) {
        setError('Please fill in all required shipping address fields marked with *');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const orderData = {
        customer_id: user.id,
        payment_method: formData.paymentMethod,
        payment_method_title: formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                             formData.paymentMethod === 'card' ? 'Credit Card / Debit Card' : 'PayPal',
        set_paid: false,
        billing: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          company: formData.company,
          address_1: formData.address1,
          address_2: formData.address2,
          city: formData.city,
          state: formData.state,
          postcode: formData.zipCode,
          country: formData.country,
          email: formData.email,
          phone: formData.phone
        },
        shipping: formData.shipToDifferent ? {
          first_name: formData.shippingFirstName || formData.firstName,
          last_name: formData.shippingLastName || formData.lastName,
          company: formData.shippingCompany || formData.company,
          address_1: formData.shippingAddress1 || formData.address1,
          address_2: formData.shippingAddress2 || formData.address2,
          city: formData.shippingCity || formData.city,
          state: formData.shippingState || formData.state,
          postcode: formData.shippingZipCode || formData.zipCode,
          country: formData.shippingCountry || formData.country
        } : {
          first_name: formData.firstName,
          last_name: formData.lastName,
          company: formData.company,
          address_1: formData.address1,
          address_2: formData.address2,
          city: formData.city,
          state: formData.state,
          postcode: formData.zipCode,
          country: formData.country
        },
        line_items: cart
          .filter(item => {
            const price = parseFloat(item.price || item.regular_price || 0);
            return item.id && item.quantity && price > 0;
          })
          .map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: parseFloat(item.price || item.regular_price || 0)
          })),
        shipping_lines: [
          {
            method_id: 'flat_rate',
            method_title: 'Flat Rate',
            total: '0.00'
          }
        ],
        fee_lines: [],
        coupon_lines: appliedCoupon ? [
          {
            code: appliedCoupon.code,
            amount: String(couponDiscount)
          }
        ] : [],
        total: String(cartTotal + (appliedCoupon ? -couponDiscount : 0))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        setOrderId(data.order.id);
        setOrderSuccess(true);
        clearCart();
        
        // Restore cart backup if it exists (from Buy Now functionality)
        if (cartBackup) {
          console.log('🛒 Restoring cart backup after order completion');
          setTimeout(() => {
            restoreCart();
          }, 100); // Small delay to ensure cart is cleared first
        }
        
        // Redirect to order success page after 2 seconds
        setTimeout(() => {
          router.push(`/order-success?orderId=${data.order.id}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to create order. Please try again.');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      setError('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <PleaseSignIn 
        title="Complete Your Purchase"
        message="Please sign in to proceed with checkout and complete your order securely."
        redirectTo="checkout"
      />
    );
  }

  // Show loading state when order is being processed
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Order</h2>
          <p className="text-gray-600">Please wait while we process your order...</p>
        </div>
      </div>
    );
  }

  // Show empty cart message
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Checkout</h1>
            <p className="text-gray-600 text-lg">Complete your purchase</p>
          </div>

          {/* Empty Cart Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12 text-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/30 to-blue-100/30 rounded-full translate-y-12 -translate-x-12"></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-8 animate-float">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">
                  Your cart is empty
                </h2>
                
                {/* Description */}
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto animate-slide-up">
                  Looks like you haven't added any items to your cart yet. Start shopping to discover amazing products!
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
                  <button
                    onClick={() => router.push('/')}
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <span className="relative z-10 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Browse Products
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  </button>
                  
                  <button
                    onClick={() => router.push('/blog')}
                    className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      Read Our Blog
                    </span>
                  </button>
                </div>

                {/* Additional Info */}
                <div className="mt-12 pt-8 border-t border-gray-200/50">
                  <p className="text-sm text-gray-500 mb-4">Need help getting started?</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                    <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                      📞 Contact Support
                    </a>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                      ❓ FAQ
                    </a>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                      🚚 Shipping Info
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show order success
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-2">Order ID: #{orderId}</p>
          <p className="text-gray-600 mb-6">Redirecting to order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-sm border-b mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">
              Complete your purchase
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Details */}
            <div className="bg-white shadow-sm border rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Billing Details
              </h2>
              
                {/* Address Selector */}
                <div className="mb-6">
                  {/* <AddressSelector
                    addresses={billingAddresses}
                    selectedAddress={selectedBillingAddress}
                    onSelectAddress={handleSelectBillingAddress}
                    onAddNew={() => handleAddNewAddress('billing')}
                    onEdit={(address) => handleEditAddress(address, 'billing')}
                    type="billing"
                  /> */}
                </div>

              {/* Manual Form Fields (hidden when address is selected) */}
              <div className="space-y-4">
                {/* First Name and Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Company Name and Phone Number in one row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                      Company name (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Email address on its own row */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>

                {/* Country/Region only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                    Country / Region <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                    required
                  >
                    <option value="US">United States (US)</option>
                    <option value="IN">India</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                  </select>
                </div>

                {/* Street Address - Two fields in one row */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                    Street address <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.address1}
                      onChange={(e) => handleInputChange('address1', e.target.value)}
                      placeholder="House number and street name"
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      value={formData.address2}
                      onChange={(e) => handleInputChange('address2', e.target.value)}
                      placeholder="Apartment, suite, unit, etc. (optional)"
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Town/City and State in one row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                      Town / City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                      required
                    >
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                      <option value="FL">Florida</option>
                      <option value="IL">Illinois</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="OH">Ohio</option>
                      <option value="GA">Georgia</option>
                      <option value="NC">North Carolina</option>
                      <option value="MI">Michigan</option>
                    </select>
                  </div>
                </div>

                                {/* ZIP Code only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>

                {/* Additional Options */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.shipToDifferent}
                      onChange={(e) => handleInputChange('shipToDifferent', e.target.checked)}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Ship to a different address?</span>
                  </label>
                </div>

                {/* Order Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                    Order notes (optional)
                  </label>
                  <textarea
                    value={formData.orderNotes}
                    onChange={(e) => handleInputChange('orderNotes', e.target.value)}
                    placeholder="Notes about your order, e.g. special notes for delivery."
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address - Only show when checkbox is checked */}
            {formData.shipToDifferent && (
              <div className="bg-white shadow-sm border rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <TruckIcon className="w-5 h-5 mr-2" />
                  Shipping Address
                </h2>
                
                {/* Address Selector */}
                <div className="mb-6">
                  {/* <AddressSelector
                    addresses={shippingAddresses}
                    selectedAddress={selectedShippingAddress}
                    onSelectAddress={handleSelectShippingAddress}
                    onAddNew={() => handleAddNewAddress('shipping')}
                    onEdit={(address) => handleEditAddress(address, 'shipping')}
                    type="shipping"
                  /> */}
                </div>

                {/* Manual Form Fields (hidden when address is selected) */}
                <div className="space-y-4">
                  {/* First Name and Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.shippingFirstName || formData.firstName}
                      onChange={(e) => handleInputChange('shippingFirstName', e.target.value)}
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.shippingLastName || formData.lastName}
                      onChange={(e) => handleInputChange('shippingLastName', e.target.value)}
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  </div>

                  {/* Company Name and Phone Number in one row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                        Company name (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.shippingCompany || formData.company}
                        onChange={(e) => handleInputChange('shippingCompany', e.target.value)}
                        className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                        Phone (optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.shippingPhone || formData.phone}
                        onChange={(e) => handleInputChange('shippingPhone', e.target.value)}
                        className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Email address on its own row */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.shippingEmail || formData.email}
                      onChange={(e) => handleInputChange('shippingEmail', e.target.value)}
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Country/Region only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                      Country / Region <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.shippingCountry || formData.country}
                      onChange={(e) => handleInputChange('shippingCountry', e.target.value)}
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                      required
                    >
                      <option value="US">United States (US)</option>
                      <option value="IN">India</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                    </select>
                  </div>

                  {/* Street Address - Two fields in one row */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                      Street address <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={formData.shippingAddress1 || formData.address1}
                        onChange={(e) => handleInputChange('shippingAddress1', e.target.value)}
                        placeholder="House number and street name"
                        className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                      <input
                        type="text"
                        value={formData.shippingAddress2 || formData.address2}
                        onChange={(e) => handleInputChange('shippingAddress2', e.target.value)}
                        placeholder="Apartment, suite, unit, etc. (optional)"
                        className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Town/City and State in one row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                        Town / City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.shippingCity || formData.city}
                        onChange={(e) => handleInputChange('shippingCity', e.target.value)}
                        className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select 
                        value={formData.shippingState || formData.state}
                        onChange={(e) => handleInputChange('shippingState', e.target.value)}
                        className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                        required
                      >
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                        <option value="IL">Illinois</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="OH">Ohio</option>
                        <option value="GA">Georgia</option>
                        <option value="NC">North Carolina</option>
                        <option value="MI">Michigan</option>
                      </select>
                    </div>
                  </div>

                  {/* ZIP Code only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 min-h-[20px] flex items-center">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.shippingZipCode || formData.zipCode}
                      onChange={(e) => handleInputChange('shippingZipCode', e.target.value)}
                      className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white shadow-sm border rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">Cash on Delivery</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">Credit Card / Debit Card</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={formData.paymentMethod === 'paypal'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">PayPal</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm border rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image || item.images?.[0]?.src || '/images/placeholders/product-placeholder.svg'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = '/images/placeholders/product-placeholder.svg';
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900">{formatPrice((parseFloat(item.price || item.regular_price || 0)) * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Coupon Input */}
              <CouponInput />

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Coupon Discount</span>
                    <span className="text-green-600">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{formatPrice(0)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="w-full mt-6 px-4 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Placing Order...' : 'Place Order'}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {/* <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        address={editingAddress}
        type={addressModalType}
        userId={user?.id}
      /> */}
    </div>
  );
}
