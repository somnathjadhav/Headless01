import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function ProductsColorPreview() {
  const [colorScheme, setColorScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColorScheme = async () => {
      try {
        const response = await fetch('/api/theme-options');
        if (response.ok) {
          const data = await response.json();
          setColorScheme(data.success ? data.data : data);
        }
      } catch (error) {
        console.error('Error fetching color scheme:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchColorScheme();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading color scheme...</p>
        </div>
      </div>
    );
  }

  if (!colorScheme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load color scheme</p>
          <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  // Apply color scheme as inline styles
  const colorStyles = {
    backgroundColor: colorScheme.backgroundColor,
    color: colorScheme.textColor,
    '--primary-color': colorScheme.primaryColor,
    '--secondary-color': colorScheme.secondaryColor,
    '--accent-color': colorScheme.accentColor,
    '--text-color': colorScheme.textColor,
    '--heading-color': colorScheme.headingColor,
    '--surface-color': colorScheme.surfaceColor,
    '--success-color': colorScheme.successColor,
    '--warning-color': colorScheme.warningColor,
    '--error-color': colorScheme.errorColor,
  };

  return (
    <>
      <Head>
        <title>Products - Color Scheme Preview</title>
        <meta name="description" content="Product page with current backend color scheme" />
      </Head>

      <div className="min-h-screen" style={colorStyles}>
        {/* Header */}
        <header className="border-b" style={{ backgroundColor: colorScheme.surfaceColor, borderColor: colorScheme.secondaryColor }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="hover:opacity-80 transition-opacity" style={{ color: colorScheme.primaryColor }}>
                  ← Back to Home
                </Link>
                <h1 className="text-2xl font-bold" style={{ color: colorScheme.headingColor }}>
                  Products - Color Preview
                </h1>
              </div>
              <div className="text-sm opacity-75" style={{ color: colorScheme.textColor }}>
                Backend Color Scheme
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Color Scheme Info */}
          <div className="mb-8 p-6 rounded-lg border" style={{ backgroundColor: colorScheme.surfaceColor, borderColor: colorScheme.secondaryColor }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colorScheme.headingColor }}>
              Current Backend Color Scheme
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 border-2"
                  style={{ backgroundColor: colorScheme.primaryColor, borderColor: colorScheme.secondaryColor }}
                ></div>
                <p className="text-sm font-medium" style={{ color: colorScheme.textColor }}>Primary</p>
                <p className="text-xs opacity-75" style={{ color: colorScheme.textColor }}>{colorScheme.primaryColor}</p>
              </div>
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 border-2"
                  style={{ backgroundColor: colorScheme.secondaryColor, borderColor: colorScheme.primaryColor }}
                ></div>
                <p className="text-sm font-medium" style={{ color: colorScheme.textColor }}>Secondary</p>
                <p className="text-xs opacity-75" style={{ color: colorScheme.textColor }}>{colorScheme.secondaryColor}</p>
              </div>
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 border-2"
                  style={{ backgroundColor: colorScheme.accentColor, borderColor: colorScheme.secondaryColor }}
                ></div>
                <p className="text-sm font-medium" style={{ color: colorScheme.textColor }}>Accent</p>
                <p className="text-xs opacity-75" style={{ color: colorScheme.textColor }}>{colorScheme.accentColor}</p>
              </div>
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 border-2"
                  style={{ backgroundColor: colorScheme.successColor, borderColor: colorScheme.secondaryColor }}
                ></div>
                <p className="text-sm font-medium" style={{ color: colorScheme.textColor }}>Success</p>
                <p className="text-xs opacity-75" style={{ color: colorScheme.textColor }}>{colorScheme.successColor}</p>
              </div>
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 border-2"
                  style={{ backgroundColor: colorScheme.warningColor, borderColor: colorScheme.secondaryColor }}
                ></div>
                <p className="text-sm font-medium" style={{ color: colorScheme.textColor }}>Warning</p>
                <p className="text-xs opacity-75" style={{ color: colorScheme.textColor }}>{colorScheme.warningColor}</p>
              </div>
            </div>
          </div>

          {/* Product Grid Preview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: colorScheme.headingColor }}>
              Product Grid Preview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Sample Product Cards */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div 
                  key={item} 
                  className="rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: colorScheme.surfaceColor, borderColor: colorScheme.secondaryColor }}
                >
                  {/* Product Image Placeholder */}
                  <div 
                    className="w-full h-48 flex items-center justify-center"
                    style={{ backgroundColor: colorScheme.secondaryColor }}
                  >
                    <span className="text-2xl opacity-50" style={{ color: colorScheme.textColor }}>
                      📦
                    </span>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold mb-2" style={{ color: colorScheme.headingColor }}>
                      Sample Product {item}
                    </h3>
                    <p className="text-sm mb-3 opacity-75" style={{ color: colorScheme.textColor }}>
                      This is a sample product description to show how text appears with the current color scheme.
                    </p>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold" style={{ color: colorScheme.primaryColor }}>
                        $99.99
                      </span>
                      <span className="text-sm line-through opacity-50" style={{ color: colorScheme.textColor }}>
                        $149.99
                      </span>
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex space-x-2">
                      <button 
                        className="flex-1 py-2 px-4 rounded font-medium transition-colors"
                        style={{ 
                          backgroundColor: colorScheme.primaryColor, 
                          color: colorScheme.backgroundColor 
                        }}
                      >
                        Add to Cart
                      </button>
                      <button 
                        className="py-2 px-4 rounded border font-medium transition-colors"
                        style={{ 
                          borderColor: colorScheme.accentColor, 
                          color: colorScheme.accentColor,
                          backgroundColor: 'transparent'
                        }}
                      >
                        ♥
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UI Elements Preview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: colorScheme.headingColor }}>
              UI Elements Preview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Buttons */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: colorScheme.headingColor }}>Buttons</h3>
                <div className="space-y-3">
                  <button 
                    className="w-full py-3 px-6 rounded font-medium"
                    style={{ backgroundColor: colorScheme.primaryColor, color: colorScheme.backgroundColor }}
                  >
                    Primary Button
                  </button>
                  <button 
                    className="w-full py-3 px-6 rounded border font-medium"
                    style={{ borderColor: colorScheme.secondaryColor, color: colorScheme.textColor, backgroundColor: 'transparent' }}
                  >
                    Secondary Button
                  </button>
                  <button 
                    className="w-full py-3 px-6 rounded font-medium"
                    style={{ backgroundColor: colorScheme.accentColor, color: colorScheme.backgroundColor }}
                  >
                    Accent Button
                  </button>
                </div>
              </div>

              {/* Form Elements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: colorScheme.headingColor }}>Form Elements</h3>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="w-full py-3 px-4 rounded border"
                    style={{ 
                      backgroundColor: colorScheme.surfaceColor, 
                      borderColor: colorScheme.secondaryColor, 
                      color: colorScheme.textColor 
                    }}
                  />
                  <select 
                    className="w-full py-3 px-4 rounded border"
                    style={{ 
                      backgroundColor: colorScheme.surfaceColor, 
                      borderColor: colorScheme.secondaryColor, 
                      color: colorScheme.textColor 
                    }}
                  >
                    <option>All Categories</option>
                    <option>Electronics</option>
                    <option>Clothing</option>
                    <option>Books</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: colorScheme.headingColor }}>
              Status Messages
            </h2>
            <div className="space-y-3">
              <div 
                className="p-4 rounded border-l-4"
                style={{ 
                  backgroundColor: colorScheme.successColor + '20', 
                  borderLeftColor: colorScheme.successColor,
                  color: colorScheme.textColor 
                }}
              >
                ✅ Success: Product added to cart successfully!
              </div>
              <div 
                className="p-4 rounded border-l-4"
                style={{ 
                  backgroundColor: colorScheme.warningColor + '20', 
                  borderLeftColor: colorScheme.warningColor,
                  color: colorScheme.textColor 
                }}
              >
                ⚠️ Warning: Only 3 items left in stock!
              </div>
              <div 
                className="p-4 rounded border-l-4"
                style={{ 
                  backgroundColor: colorScheme.errorColor + '20', 
                  borderLeftColor: colorScheme.errorColor,
                  color: colorScheme.textColor 
                }}
              >
                ❌ Error: Failed to add product to cart.
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center space-x-4">
            <Link 
              href="/products" 
              className="py-2 px-6 rounded border font-medium transition-colors"
              style={{ 
                borderColor: colorScheme.secondaryColor, 
                color: colorScheme.textColor,
                backgroundColor: 'transparent'
              }}
            >
              View Real Products
            </Link>
            <Link 
              href="/typography" 
              className="py-2 px-6 rounded font-medium transition-colors"
              style={{ 
                backgroundColor: colorScheme.primaryColor, 
                color: colorScheme.backgroundColor 
              }}
            >
              Typography Preview
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
