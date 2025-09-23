import React, { useState, useEffect } from 'react';
import { MapPinIcon, PlusIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';

const AddressSelector = ({ 
  addresses = [], 
  selectedAddress, 
  onSelectAddress, 
  onAddNew, 
  onEdit,
  type = 'billing' // 'billing' or 'shipping'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand if there are multiple addresses
  useEffect(() => {
    if (addresses.length > 1) {
      setIsExpanded(true);
    }
  }, [addresses.length]);

  const formatAddress = (address) => {
    const parts = [
      address.address_1,
      address.address_2,
      address.city,
      address.state,
      address.postcode,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const getAddressDisplayName = (address) => {
    if (address.nickname) return address.nickname;
    if (address.company) return `${address.company} - ${address.city}`;
    return `${address.first_name} ${address.last_name} - ${address.city}`;
  };

  if (addresses.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
        <div className="text-center">
          <MapPinIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-3">No {type} addresses saved</p>
          <button
            onClick={onAddNew}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Address
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Address Selection Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPinIcon className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            {type === 'billing' ? 'Billing Address' : 'Shipping Address'}
          </span>
          {addresses.length > 1 && (
            <span className="text-xs text-gray-500">({addresses.length} saved)</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {addresses.length > 1 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isExpanded ? 'Hide' : 'Show All'}
            </button>
          )}
          <button
            onClick={onAddNew}
            className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add New
          </button>
        </div>
      </div>

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <CheckIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {getAddressDisplayName(selectedAddress)}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Selected
                </span>
              </div>
              <p className="text-sm text-blue-800">
                {selectedAddress.first_name} {selectedAddress.last_name}
                {selectedAddress.company && `, ${selectedAddress.company}`}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {formatAddress(selectedAddress)}
              </p>
              {selectedAddress.phone && (
                <p className="text-sm text-blue-700">Phone: {selectedAddress.phone}</p>
              )}
            </div>
            <button
              onClick={() => onEdit(selectedAddress)}
              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Address List (when expanded) */}
      {isExpanded && addresses.length > 1 && (
        <div className="space-y-2">
          {addresses.map((address, index) => (
            <div
              key={address.id || index}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedAddress?.id === address.id || 
                (selectedAddress && !address.id && index === 0)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onSelectAddress(address)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectAddress(address);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Select address: ${address.nickname || 'Default address'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {getAddressDisplayName(address, index)}
                    </span>
                    {(selectedAddress?.id === address.id || 
                      (selectedAddress && !address.id && index === 0)) && (
                      <CheckIcon className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    {address.first_name} {address.last_name}
                    {address.company && `, ${address.company}`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatAddress(address)}
                  </p>
                  {address.phone && (
                    <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(address);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single Address Display (when not expanded) */}
      {!isExpanded && addresses.length === 1 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {getAddressDisplayName(addresses[0])}
              </p>
              <p className="text-sm text-gray-700">
                {addresses[0].first_name} {addresses[0].last_name}
                {addresses[0].company && `, ${addresses[0].company}`}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {formatAddress(addresses[0])}
              </p>
              {addresses[0].phone && (
                <p className="text-sm text-gray-600">Phone: {addresses[0].phone}</p>
              )}
            </div>
            <button
              onClick={() => onEdit(addresses[0])}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
