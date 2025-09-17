import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Typography({ themeOptions, error }) {

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const ColorSwatch = ({ color, name, description }) => (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border">
      <div 
        className="w-16 h-16 rounded-lg border-2 border-gray-200 shadow-sm"
        style={{ backgroundColor: color }}
      ></div>
      <div>
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-sm font-mono text-gray-500">{color}</p>
      </div>
    </div>
  );

  const TypographyExample = ({ font, size, weight, lineHeight, letterSpacing, label, element = 'p' }) => {
    const style = {
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      lineHeight: lineHeight,
      letterSpacing: letterSpacing,
    };

    const Component = element;
    
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">{label}</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Font:</strong> {font}</p>
            <p><strong>Size:</strong> {size}</p>
            <p><strong>Weight:</strong> {weight}</p>
            <p><strong>Line Height:</strong> {lineHeight}</p>
            <p><strong>Letter Spacing:</strong> {letterSpacing}</p>
          </div>
        </div>
        <div className="border-t pt-4">
          <Component style={style} className="text-gray-900">
            The quick brown fox jumps over the lazy dog. 1234567890
          </Component>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Typography & Colors - WordPress Theme Settings</title>
        <meta name="description" content="Typography and color settings from WordPress backend" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                  ← Back to Home
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Typography & Colors</h1>
              </div>
              <div className="text-sm text-gray-500">
                WordPress Theme Settings
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {themeOptions && (
            <>
              {/* Color Palette */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Color Palette</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ColorSwatch 
                    color={themeOptions.primaryColor} 
                    name="Primary Color" 
                    description="Main brand color"
                  />
                  <ColorSwatch 
                    color={themeOptions.secondaryColor} 
                    name="Secondary Color" 
                    description="Secondary brand color"
                  />
                  <ColorSwatch 
                    color={themeOptions.accentColor} 
                    name="Accent Color" 
                    description="Accent and highlight color"
                  />
                  <ColorSwatch 
                    color={themeOptions.textColor} 
                    name="Text Color" 
                    description="Main text color"
                  />
                  <ColorSwatch 
                    color={themeOptions.headingColor} 
                    name="Heading Color" 
                    description="Headings and titles"
                  />
                  <ColorSwatch 
                    color={themeOptions.backgroundColor} 
                    name="Background Color" 
                    description="Page background"
                  />
                  <ColorSwatch 
                    color={themeOptions.surfaceColor} 
                    name="Surface Color" 
                    description="Cards and surfaces"
                  />
                  <ColorSwatch 
                    color={themeOptions.successColor} 
                    name="Success Color" 
                    description="Success messages"
                  />
                  <ColorSwatch 
                    color={themeOptions.warningColor} 
                    name="Warning Color" 
                    description="Warning messages"
                  />
                  <ColorSwatch 
                    color={themeOptions.errorColor} 
                    name="Error Color" 
                    description="Error messages"
                  />
                </div>
              </section>

              {/* Typography Examples */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Typography Examples</h2>
                
                {/* Headings */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Headings</h3>
                  <div className="space-y-6">
                    <TypographyExample
                      font={themeOptions.h1Font}
                      size={themeOptions.h1Size}
                      weight={themeOptions.h1Weight}
                      lineHeight={themeOptions.h1LineHeight}
                      letterSpacing="0px"
                      label="H1 - Main Heading"
                      element="h1"
                    />
                    <TypographyExample
                      font={themeOptions.h2Font}
                      size={themeOptions.h2Size}
                      weight={themeOptions.h2Weight}
                      lineHeight={themeOptions.h2LineHeight}
                      letterSpacing="0px"
                      label="H2 - Section Heading"
                      element="h2"
                    />
                    <TypographyExample
                      font={themeOptions.h3Font}
                      size={themeOptions.h3Size}
                      weight={themeOptions.h3Weight}
                      lineHeight={themeOptions.h3LineHeight}
                      letterSpacing="0px"
                      label="H3 - Subsection Heading"
                      element="h3"
                    />
                    <TypographyExample
                      font={themeOptions.h4Font}
                      size={themeOptions.h4Size}
                      weight={themeOptions.h4Weight}
                      lineHeight={themeOptions.h4LineHeight}
                      letterSpacing="0px"
                      label="H4 - Minor Heading"
                      element="h4"
                    />
                    <TypographyExample
                      font={themeOptions.h5Font}
                      size={themeOptions.h5Size}
                      weight={themeOptions.h5Weight}
                      lineHeight={themeOptions.h5LineHeight}
                      letterSpacing="0px"
                      label="H5 - Small Heading"
                      element="h5"
                    />
                    <TypographyExample
                      font={themeOptions.h6Font}
                      size={themeOptions.h6Size}
                      weight={themeOptions.h6Weight}
                      lineHeight={themeOptions.h6LineHeight}
                      letterSpacing="0px"
                      label="H6 - Smallest Heading"
                      element="h6"
                    />
                  </div>
                </div>

                {/* Body Text */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Body Text</h3>
                  <div className="space-y-6">
                    <TypographyExample
                      font={themeOptions.bodyFont}
                      size={themeOptions.bodySize}
                      weight={themeOptions.bodyWeight}
                      lineHeight={themeOptions.bodyLineHeight}
                      letterSpacing="0px"
                      label="Body Text - Main content"
                      element="p"
                    />
                    <TypographyExample
                      font={themeOptions.primaryFont}
                      size={themeOptions.primarySize}
                      weight={themeOptions.primaryWeight}
                      lineHeight={themeOptions.primaryLineHeight}
                      letterSpacing={themeOptions.primaryLetterSpacing}
                      label="Primary Text - Important content"
                      element="p"
                    />
                    <TypographyExample
                      font={themeOptions.secondaryFont}
                      size="16px"
                      weight={themeOptions.secondaryWeight}
                      lineHeight="1.5"
                      letterSpacing={themeOptions.secondaryLetterSpacing}
                      label="Secondary Text - Supporting content"
                      element="p"
                    />
                  </div>
                </div>
              </section>

              {/* Color Usage Examples */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Color Usage Examples</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-lg" style={{ backgroundColor: themeOptions.primaryColor }}>
                    <h3 className="text-white text-xl font-semibold mb-2">Primary Color Usage</h3>
                    <p className="text-white opacity-90">This is how the primary color looks with white text.</p>
                  </div>
                  <div className="p-6 rounded-lg" style={{ backgroundColor: themeOptions.secondaryColor }}>
                    <h3 className="text-white text-xl font-semibold mb-2">Secondary Color Usage</h3>
                    <p className="text-white opacity-90">This is how the secondary color looks with white text.</p>
                  </div>
                  <div className="p-6 rounded-lg border-2" style={{ borderColor: themeOptions.accentColor }}>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: themeOptions.accentColor }}>Accent Color Usage</h3>
                    <p className="text-gray-700">This shows the accent color used for borders and highlights.</p>
                  </div>
                  <div className="p-6 rounded-lg" style={{ backgroundColor: themeOptions.surfaceColor }}>
                    <h3 className="text-white text-xl font-semibold mb-2">Surface Color Usage</h3>
                    <p className="text-white opacity-90">This is how the surface color looks for cards and panels.</p>
                  </div>
                </div>
              </section>

              {/* Raw Data */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Raw Theme Data</h2>
                <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                  <pre className="text-green-400 text-sm">
                    {JSON.stringify(themeOptions, null, 2)}
                  </pre>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:10008';
    const response = await fetch(`${baseUrl}/wp-json/eternitty/v1/theme-options`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch theme options: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      props: {
        themeOptions: data,
        error: null,
      },
    };
  } catch (error) {
    return {
      props: {
        themeOptions: null,
        error: error.message,
      },
    };
  }
}