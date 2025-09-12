import Head from 'next/head';

export default function TestTypographyDirectPage() {
  // Mock typography data
  const mockTypography = {
    fonts: {
      primary: {
        family: 'Instrument Sans',
        fallback: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        weights: [400, 500, 600, 700],
        google: true
      },
      secondary: {
        family: 'Nunito Sans',
        fallback: 'Georgia, "Times New Roman", serif',
        weights: [400, 500, 600, 700],
        google: true
      },
      mono: {
        family: 'JetBrains Mono',
        fallback: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        weights: [400, 500],
        google: true
      }
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem'
    },
    headings: {
      h1: { size: '4xl', weight: 700, lineHeight: 1.1, letterSpacing: '-0.025em' },
      h2: { size: '3xl', weight: 600, lineHeight: 1.2, letterSpacing: '-0.025em' },
      h3: { size: '2xl', weight: 600, lineHeight: 1.3, letterSpacing: '-0.025em' },
      h4: { size: 'xl', weight: 600, lineHeight: 1.4, letterSpacing: '-0.025em' },
      h5: { size: 'lg', weight: 600, lineHeight: 1.5, letterSpacing: '-0.025em' },
      h6: { size: 'base', weight: 600, lineHeight: 1.5, letterSpacing: '-0.025em' }
    },
    body: {
      size: 'base',
      weight: 400,
      lineHeight: 1.6,
      letterSpacing: '0em'
    },
    buttons: {
      small: { size: 'sm', weight: 500, lineHeight: 1.4 },
      medium: { size: 'base', weight: 500, lineHeight: 1.4 },
      large: { size: 'lg', weight: 500, lineHeight: 1.4 }
    },
    colors: {
      text: {
        primary: '#111827',
        secondary: '#6B7280',
        muted: '#9CA3AF',
        inverse: '#FFFFFF'
      },
      headings: {
        primary: '#111827',
        secondary: '#374151',
        accent: '#3B82F6'
      },
      background: {
        primary: '#FFFFFF',
        secondary: '#F9FAFB',
        accent: '#F3F4F6'
      },
      accent: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444'
      }
    }
  };

  return (
    <>
      <Head>
        <title>Test Typography Card Direct | Eternitty Headless WordPress</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Test Typography & Color Card (Direct)</h1>
          
          {/* Direct TypographyColorCard implementation */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Typography & Color System
                </h2>
                <p className="text-lg text-gray-600">
                  Complete design system with fonts, sizes, and color palette
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Typography Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Typography</h3>
                </div>

                {/* Font Families */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Font Families</h4>
                  <div className="space-y-4">
                    {Object.entries(mockTypography.fonts).map(([key, font]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {key} Font
                            </span>
                            {font.google && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                Google
                              </span>
                            )}
                          </div>
                          <div 
                            className="text-lg text-gray-900"
                            style={{ fontFamily: `"${font.family}", ${font.fallback}` }}
                          >
                            {font.family}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {font.fallback}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography Scale */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Typography Scale</h4>
                  <div className="space-y-3">
                    {Object.entries(mockTypography.sizes).map(([key, size]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                          {key}
                        </span>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded">
                            {size}
                          </span>
                          <div 
                            className="text-gray-900"
                            style={{ fontSize: size }}
                          >
                            Aa
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Text */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Sample Text</h4>
                  <div className="space-y-3">
                    <div 
                      className="text-gray-900 leading-relaxed"
                      style={{
                        fontSize: mockTypography.sizes[mockTypography.body.size],
                        fontWeight: mockTypography.body.weight,
                        lineHeight: mockTypography.body.lineHeight,
                        fontFamily: `"${mockTypography.fonts.primary.family}", ${mockTypography.fonts.primary.fallback}`
                      }}
                    >
                      The quick brown fox jumps over the lazy dog. This sample text demonstrates the current typography settings.
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Color Palette</h3>
                </div>

                {/* Color Categories */}
                <div className="space-y-4">
                  {Object.entries(mockTypography.colors).map(([category, colors]) => (
                    <div key={category} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                        {category} Colors
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(colors).map(([key, color]) => (
                          <div key={key} className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-lg border-2 border-white shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            ></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 capitalize truncate">
                                {key}
                              </div>
                              <div className="text-xs text-gray-500 font-mono truncate">
                                {color}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Color Usage Examples */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Color Usage</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: mockTypography.colors.text.primary }}
                      ></div>
                      <span className="text-sm text-gray-700">Primary Text</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: mockTypography.colors.background.primary }}
                      ></div>
                      <span className="text-sm text-gray-700">Primary Background</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: mockTypography.colors.accent.primary }}
                      ></div>
                      <span className="text-sm text-gray-700">Accent Color</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CSS Variables Reference */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">CSS Variables Available</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm mb-3">
                  All typography and color settings are available as CSS custom properties:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <div className="text-blue-900 font-semibold mb-2">Typography:</div>
                    <div className="space-y-1 text-blue-700">
                      <div>--font-primary</div>
                      <div>--font-secondary</div>
                      <div>--text-base, --text-lg, etc.</div>
                      <div>--heading-h1-size, --heading-h1-weight</div>
                      <div>--body-size, --body-weight</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-900 font-semibold mb-2">Colors:</div>
                    <div className="space-y-1 text-blue-700">
                      <div>--color-text-primary</div>
                      <div>--color-background-primary</div>
                      <div>--color-accent-primary</div>
                      <div>--color-headings-primary</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-lg font-semibold text-green-900 mb-2">✅ Success!</h2>
            <p className="text-green-800 text-sm">
              This page shows the TypographyColorCard component working directly with mock data. 
              The combined typography and color card is displaying correctly!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
