import React from 'react';
import * as Icons from '../icons';
import { IconButton, IconText } from './SvgIcon';

/**
 * IconShowcase Component - Demonstrates all available SVG icons
 */
export default function IconShowcase() {
  const iconCategories = {
    'Shopping & E-commerce': [
      'ShoppingCartIcon',
      'ShoppingBagIcon', 
      'HeartIcon',
      'StarIcon',
      'TruckIcon',
      'CreditCardIcon',
      'ShieldIcon',
      'GiftIcon'
    ],
    'Navigation': [
      'MenuIcon',
      'CloseIcon',
      'ChevronDownIcon',
      'ChevronUpIcon',
      'ChevronLeftIcon',
      'ChevronRightIcon'
    ],
    'Search & Filter': [
      'SearchIcon',
      'FilterIcon',
      'SortIcon'
    ],
    'User & Account': [
      'UserIcon',
      'LoginIcon',
      'LogoutIcon'
    ],
    'Actions': [
      'PlusIcon',
      'MinusIcon',
      'EditIcon',
      'DeleteIcon'
    ],
    'Status': [
      'CheckIcon',
      'XIcon',
      'ExclamationIcon',
      'InformationIcon'
    ],
    'Social Media': [
      'FacebookIcon',
      'TwitterIcon',
      'InstagramIcon'
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">SVG Icon Library</h1>
      
      {Object.entries(iconCategories).map(([category, iconNames]) => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
            {category}
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {iconNames.map((iconName) => {
              const IconComponent = Icons[iconName];
              if (!IconComponent) return null;
              
              return (
                <div key={iconName} className="text-center">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                    <IconComponent className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                    <p className="text-xs text-gray-600 font-mono">{iconName}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Icon Usage Examples */}
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Usage Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* IconButton Examples */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Icon Buttons</h3>
            <div className="space-y-3">
              <IconButton icon={Icons.HeartIcon} variant="primary" size={20} />
              <IconButton icon={Icons.StarIcon} variant="secondary" size={20} />
              <IconButton icon={Icons.EditIcon} variant="outline" size={20} />
              <IconButton icon={Icons.DeleteIcon} variant="danger" size={20} />
            </div>
          </div>

          {/* IconText Examples */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Icon with Text</h3>
            <div className="space-y-3">
              <IconText icon={Icons.ShoppingCartIcon}>Shopping Cart</IconText>
              <IconText icon={Icons.UserIcon}>User Profile</IconText>
              <IconText icon={Icons.SearchIcon}>Search Products</IconText>
              <IconText icon={Icons.StarIcon}>Favorites</IconText>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Code Examples</h3>
          <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>
{`// Import icons
import { ShoppingCartIcon, HeartIcon } from '../icons';

// Use as React component
<ShoppingCartIcon className="w-6 h-6 text-blue-600" />

// Use with IconButton
<IconButton 
  icon={HeartIcon} 
  variant="primary" 
  onClick={handleLike} 
/>

// Use with IconText
<IconText icon={StarIcon}>Add to Favorites</IconText>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
