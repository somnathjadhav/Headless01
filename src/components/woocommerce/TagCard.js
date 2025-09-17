import React from 'react';
import Link from 'next/link';
import { 
  TagIcon, 
  FireIcon, 
  StarIcon, 
  HeartIconFilled, 
  LightningIcon, 
  CrownIcon,
  SparklesIcon,
  TrendingUpIcon
} from '../icons';

export default function TagCard({ tag }) {
  if (!tag) return null;

  // Generate light colors for the tag
  const lightColors = [
    { border: 'border-l-blue-400', bg: 'bg-blue-50', icon: 'bg-blue-100', text: 'text-blue-600' },
    { border: 'border-l-purple-400', bg: 'bg-purple-50', icon: 'bg-purple-100', text: 'text-purple-600' },
    { border: 'border-l-green-400', bg: 'bg-green-50', icon: 'bg-green-100', text: 'text-green-600' },
    { border: 'border-l-pink-400', bg: 'bg-pink-50', icon: 'bg-pink-100', text: 'text-pink-600' },
    { border: 'border-l-indigo-400', bg: 'bg-indigo-50', icon: 'bg-indigo-100', text: 'text-indigo-600' },
    { border: 'border-l-teal-400', bg: 'bg-teal-50', icon: 'bg-teal-100', text: 'text-teal-600' },
    { border: 'border-l-orange-400', bg: 'bg-orange-50', icon: 'bg-orange-100', text: 'text-orange-600' },
    { border: 'border-l-cyan-400', bg: 'bg-cyan-50', icon: 'bg-cyan-100', text: 'text-cyan-600' },
    { border: 'border-l-emerald-400', bg: 'bg-emerald-50', icon: 'bg-emerald-100', text: 'text-emerald-600' },
    { border: 'border-l-violet-400', bg: 'bg-violet-50', icon: 'bg-violet-100', text: 'text-violet-600' },
  ];
  
  const colorScheme = lightColors[tag.id % lightColors.length];

  // Select icon based on tag name or use default
  const getTagIcon = (tagName) => {
    const name = tagName.toLowerCase();
    if (name.includes('hot') || name.includes('fire') || name.includes('trending')) {
      return <FireIcon className="w-6 h-6" />;
    }
    if (name.includes('favorite') || name.includes('love') || name.includes('heart')) {
      return <HeartIconFilled className="w-6 h-6" />;
    }
    if (name.includes('premium') || name.includes('luxury') || name.includes('crown')) {
      return <CrownIcon className="w-6 h-6" />;
    }
    if (name.includes('new') || name.includes('latest') || name.includes('fresh')) {
      return <SparklesIcon className="w-6 h-6" />;
    }
    if (name.includes('sale') || name.includes('deal') || name.includes('offer')) {
      return <LightningIcon className="w-6 h-6" />;
    }
    if (name.includes('best') || name.includes('top') || name.includes('featured')) {
      return <StarIcon className="w-6 h-6" />;
    }
    if (name.includes('popular') || name.includes('trending') || name.includes('rising')) {
      return <TrendingUpIcon className="w-6 h-6" />;
    }
    return <TagIcon className="w-6 h-6" />;
  };

  const tagIcon = getTagIcon(tag.name);

  return (
    <Link href={`/tags/${tag.slug}`}>
      <div className={`group bg-white rounded-lg shadow-sm border-l-4 ${colorScheme.border} hover:shadow-md hover:${colorScheme.bg} transition-all duration-300 cursor-pointer overflow-hidden`}>
        {/* Tag Content */}
        <div className="p-4">
          <div className="flex items-center space-x-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className={`p-2 ${colorScheme.icon} rounded-lg group-hover:${colorScheme.bg} transition-colors duration-200`}>
                <div className={`${colorScheme.text} group-hover:${colorScheme.text} transition-colors duration-200`}>
                  {tagIcon}
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold text-gray-900 group-hover:${colorScheme.text} transition-colors duration-200 truncate`}>
                {tag.name}
              </h3>
              
              {tag.description && (
                <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                  {tag.description.replace(/<[^>]*>/g, '')}
                </p>
              )}
              
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorScheme.icon} ${colorScheme.text} group-hover:${colorScheme.bg} transition-all duration-200`}>
                  {tag.count} {tag.count === 1 ? 'product' : 'products'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
