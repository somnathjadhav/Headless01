import React, { useState, useEffect } from 'react';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';

const AddressModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  address = null, 
  type = 'billing',
  userId 
}) => {
  const [formData, setFormData] = useState({
    nickname: '',
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'US',
    phone: '',
    email: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when address changes
  useEffect(() => {
    if (address) {
      setFormData({
        nickname: address.nickname || '',
        first_name: address.first_name || '',
        last_name: address.last_name || '',
        company: address.company || '',
        address_1: address.address_1 || '',
        address_2: address.address_2 || '',
        city: address.city || '',
        state: address.state || '',
        postcode: address.postcode || '',
        country: address.country || 'US',
        phone: address.phone || '',
        email: address.email || ''
      });
    } else {
      setFormData({
        nickname: '',
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        country: 'US',
        phone: '',
        email: ''
      });
    }
  }, [address]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.first_name || !formData.last_name || !formData.address_1 || 
        !formData.city || !formData.state || !formData.postcode) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const addressData = {
        ...formData,
        user_id: userId,
        type: type
      };

      await onSave(addressData);
      onClose();
    } catch (error) {
      setError('Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">
              {address ? 'Edit' : 'Add New'} {type === 'billing' ? 'Billing' : 'Shipping'} Address
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Nickname */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
              Address Nickname (optional)
            </label>
            <input
              id="nickname"
              type="text"
              value={formData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              placeholder="e.g., Home, Office, Mom's House"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* First Name and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Company and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company (optional)
              </label>
              <input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country / Region <span className="text-red-500">*</span>
            </label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Street Address */}
          <div>
            <label htmlFor="address_1" className="block text-sm font-medium text-gray-700 mb-1">
              Street address <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                id="address_1"
                type="text"
                value={formData.address_1}
                onChange={(e) => handleInputChange('address_1', e.target.value)}
                placeholder="House number and street name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                id="address_2"
                type="text"
                value={formData.address_2}
                onChange={(e) => handleInputChange('address_2', e.target.value)}
                placeholder="Apartment, suite, unit, etc. (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* City and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Town / City <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* ZIP Code */}
          <div>
            <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <input
              id="postcode"
              type="text"
              value={formData.postcode}
              onChange={(e) => handleInputChange('postcode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : (address ? 'Update Address' : 'Save Address')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
