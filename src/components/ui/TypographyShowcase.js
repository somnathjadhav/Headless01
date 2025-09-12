import { useTypography } from '../../context/TypographyContext';
import TypographyColorCard from './TypographyColorCard';

export default function TypographyShowcase() {
  const { 
    typography, 
    loading, 
    error, 
    wordpressStatus, 
    wordpressUrl, 
    customTypographyFound, 
    refreshTypography 
  } = useTypography();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading typography...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={refreshTypography}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!typography) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">No typography settings found</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-400';
      case 'disconnected': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'error': return 'bg-red-100 text-red-800 border-red-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return '✅';
      case 'disconnected': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        {/* Side Panel */}
        <div className="w-64 bg-white shadow-xl min-h-screen">
          <div className="p-6">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            </div>
            
            <nav className="space-y-2">
              <a
                href="/status"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                System Status
              </a>
              
              <a
                href="/typography"
                className="flex items-center px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Typography
              </a>
              
              {/* Placeholder for future links */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 px-4 mb-2">Coming Soon</p>
                <div className="space-y-1">
                  <div className="flex items-center px-4 py-2 text-gray-400 rounded-xl">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Analytics
                  </div>
                  <div className="flex items-center px-4 py-2 text-gray-400 rounded-xl">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Typography System
                </h1>
                <p className="text-xl text-gray-600">
                  Dynamic typography settings from WordPress
                </p>
              </div>
              <button
                onClick={refreshTypography}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                🔄 Refresh Typography
              </button>
            </div>
          </div>

        {/* WordPress Integration Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">WordPress Integration Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Connection Status</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(wordpressStatus)}`}>
                <span className="mr-2">{getStatusIcon(wordpressStatus)}</span>
                {wordpressStatus.charAt(0).toUpperCase() + wordpressStatus.slice(1)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {wordpressStatus === 'connected' && 'WordPress backend is accessible'}
                {wordpressStatus === 'disconnected' && 'WordPress backend is not accessible'}
                {wordpressStatus === 'error' && 'Error connecting to WordPress backend'}
                {wordpressStatus === 'unknown' && 'WordPress connection status unknown'}
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Typography Source</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Custom Typography:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    customTypographyFound 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {customTypographyFound ? '✅ Found' : '❌ Not Found'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">WordPress URL:</span>
                  <span className="text-sm font-mono text-gray-500">{wordpressUrl || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Source:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {customTypographyFound ? 'WordPress Customizer' : 'Default System'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {wordpressStatus === 'connected' && !customTypographyFound && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">ℹ️ No Custom Typography Found</h4>
              <p className="text-sm text-yellow-700 mb-3">
                WordPress is connected but no custom typography settings were found. 
                The system is using default typography settings.
              </p>
              <div className="text-sm text-yellow-600">
                <p><strong>To add custom typography:</strong></p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Go to WordPress Admin → Appearance → Customize</li>
                  <li>Navigate to the Typography section</li>
                  <li>Configure your font settings</li>
                  <li>Save and publish</li>
                  <li>Click "Refresh Typography" button above</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Combined Typography & Color Card */}
        <TypographyColorCard />

        {/* Headings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Heading Styles</h2>
          <div className="space-y-6">
            {Object.entries(typography.headings).map(([key, heading]) => (
              <div key={key} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                  {key.toUpperCase()}
                </h3>
                <div 
                  className="mb-2"
                  style={{
                    fontSize: `var(--heading-${key}-size)`,
                    fontWeight: `var(--heading-${key}-weight)`,
                    lineHeight: `var(--heading-${key}-line-height)`,
                    letterSpacing: `var(--heading-${key}-letter-spacing)`
                  }}
                >
                  This is a {key} heading example
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Size:</strong> {heading.size}</p>
                  <p><strong>Weight:</strong> {heading.weight}</p>
                  <p><strong>Line Height:</strong> {heading.lineHeight}</p>
                  <p><strong>Letter Spacing:</strong> {heading.letterSpacing}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Body Text */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Body Text</h2>
          <div className="border rounded-lg p-4">
            <div 
              className="mb-4"
              style={{
                fontSize: `var(--body-size)`,
                fontWeight: `var(--body-weight)`,
                lineHeight: `var(--body-line-height)`,
                letterSpacing: `var(--body-letter-spacing)`
              }}
            >
              <p className="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
                nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
                eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt 
                in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Size:</strong> {typography.body.size}</p>
              <p><strong>Weight:</strong> {typography.body.weight}</p>
              <p><strong>Line Height:</strong> {typography.body.lineHeight}</p>
              <p><strong>Letter Spacing:</strong> {typography.body.letterSpacing}</p>
            </div>
          </div>
        </div>


        {/* CSS Variables Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">CSS Custom Properties</h2>
          <p className="text-blue-800 mb-4">
            All typography settings are automatically applied as CSS custom properties (CSS variables) 
            to the document root. You can use them in your CSS like this:
          </p>
          <div className="bg-blue-900 text-blue-100 p-4 rounded font-mono text-sm overflow-x-auto">
            <pre>{`/* Example usage */
.heading {
  font-family: var(--font-primary);
  font-size: var(--heading-h1-size);
  font-weight: var(--heading-h1-weight);
  line-height: var(--heading-h1-line-height);
  letter-spacing: var(--heading-h1-letter-spacing);
  color: var(--color-headings-primary);
}

.body-text {
  font-family: var(--font-primary);
  font-size: var(--body-size);
  font-weight: var(--body-weight);
  line-height: var(--body-line-height);
  color: var(--color-text-primary);
}`}</pre>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
