import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWooCommerce } from '../context/WooCommerceContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useGlobalTypography } from '../hooks/useGlobalTypography';
import CouponInput from '../components/woocommerce/CouponInput';
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
    createAccount: false,
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

  // Fetch user profile data when user is authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const response = await fetch(`/api/user-profile?userId=${user.id}`);
          const data = await response.json();
          
          if (data.success && data.profile) {
            const profile = data.profile;
            
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
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
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
    const validLineItems = cart.filter(item => item.id && item.quantity && item.price && item.price !== '');
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
          .filter(item => item.id && item.quantity && item.price && item.price !== '')
          .map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Show empty cart message
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to your cart before checkout.</p>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
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
                      checked={formData.createAccount}
                      onChange={(e) => handleInputChange('createAccount', e.target.checked)}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Create an account?</span>
                  </label>
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
                    <p className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
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
    </div>
  );
}
