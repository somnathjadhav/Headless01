import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import { 
  PulseLoader, 
  BounceLoader, 
  SpinnerLoader, 
  WaveLoader, 
  DotsLoader, 
  RingLoader, 
  GradientLoader,
  FullPageLoader,
  InlineLoader,
  CardSkeletonLoader,
  ListSkeletonLoader
} from '../components/ui/ModernLoader';
import { 
  PrimaryButton, 
  SecondaryButton, 
  DangerButton, 
  SuccessButton,
  LargeButton,
  SmallButton 
} from '../components/ui/ButtonLoader';
import { ProductGridSkeleton } from '../components/ui/SkeletonLoader';

export default function LoaderDemo() {
  const [showFullPageLoader, setShowFullPageLoader] = useState(false);
  const [buttonLoading, setButtonLoading] = useState({});

  const handleButtonClick = (buttonName) => {
    setButtonLoading(prev => ({ ...prev, [buttonName]: true }));
    
    // Simulate loading for 3 seconds
    setTimeout(() => {
      setButtonLoading(prev => ({ ...prev, [buttonName]: false }));
    }, 3000);
  };

  const handleFullPageLoader = () => {
    setShowFullPageLoader(true);
    
    // Hide after 3 seconds
    setTimeout(() => {
      setShowFullPageLoader(false);
    }, 3000);
  };

  if (showFullPageLoader) {
    return (
      <FullPageLoader 
        title="Demo Loading"
        subtitle="This is a beautiful full-page loader"
        loaderType="gradient"
      />
    );
  }

  return (
    <Layout>
      <Head>
        <title>Modern Loader Demo - Headless WooCommerce</title>
        <meta name="description" content="Beautiful, modern loading components for your application" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Modern Loader Components
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beautiful, fast, and engaging loading experiences that make your app feel premium and responsive.
            </p>
          </div>

          {/* Basic Loaders */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Loaders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Pulse Loader */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pulse Loader</h3>
                <PulseLoader size="lg" color="blue" />
                <p className="text-sm text-gray-600 mt-4">Smooth pulsing animation</p>
              </div>

              {/* Bounce Loader */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bounce Loader</h3>
                <BounceLoader size="lg" color="purple" />
                <p className="text-sm text-gray-600 mt-4">Playful bouncing dots</p>
              </div>

              {/* Spinner Loader */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spinner Loader</h3>
                <SpinnerLoader size="lg" color="green" />
                <p className="text-sm text-gray-600 mt-4">Classic spinning animation</p>
              </div>

              {/* Wave Loader */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Wave Loader</h3>
                <WaveLoader size="lg" color="red" />
                <p className="text-sm text-gray-600 mt-4">Elegant wave motion</p>
              </div>

              {/* Dots Loader */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dots Loader</h3>
                <DotsLoader size="lg" color="blue" />
                <p className="text-sm text-gray-600 mt-4">Clean dot animation</p>
              </div>

              {/* Ring Loader */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ring Loader</h3>
                <RingLoader size="lg" color="purple" />
                <p className="text-sm text-gray-600 mt-4">Sophisticated ring</p>
              </div>

              {/* Gradient Loader */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gradient Loader</h3>
                <GradientLoader size="lg" />
                <p className="text-sm text-gray-600 mt-4">Premium gradient effect</p>
              </div>

              {/* Inline Loader */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inline Loader</h3>
                <InlineLoader text="Processing..." size="md" color="blue" />
                <p className="text-sm text-gray-600 mt-4">Perfect for buttons</p>
              </div>
            </div>
          </div>

          {/* Button Loaders */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Button Loaders</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Primary Buttons</h3>
                  <PrimaryButton 
                    loading={buttonLoading.primary}
                    onClick={() => handleButtonClick('primary')}
                  >
                    Click Me
                  </PrimaryButton>
                  <LargeButton 
                    loading={buttonLoading.large}
                    onClick={() => handleButtonClick('large')}
                  >
                    Large Button
                  </LargeButton>
                  <SmallButton 
                    loading={buttonLoading.small}
                    onClick={() => handleButtonClick('small')}
                  >
                    Small Button
                  </SmallButton>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Secondary Buttons</h3>
                  <SecondaryButton 
                    loading={buttonLoading.secondary}
                    onClick={() => handleButtonClick('secondary')}
                  >
                    Secondary
                  </SecondaryButton>
                  <DangerButton 
                    loading={buttonLoading.danger}
                    onClick={() => handleButtonClick('danger')}
                  >
                    Danger
                  </DangerButton>
                  <SuccessButton 
                    loading={buttonLoading.success}
                    onClick={() => handleButtonClick('success')}
                  >
                    Success
                  </SuccessButton>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Full Page Loader</h3>
                  <button
                    onClick={handleFullPageLoader}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    Show Full Page Loader
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton Loaders */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Skeleton Loaders</h2>
            
            {/* Product Grid Skeleton */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Grid Skeleton</h3>
              <ProductGridSkeleton count={4} />
            </div>

            {/* List Skeleton */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">List Skeleton</h3>
              <ListSkeletonLoader items={5} />
            </div>

            {/* Card Skeleton */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Skeleton</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CardSkeletonLoader />
                <CardSkeletonLoader />
                <CardSkeletonLoader />
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Examples</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Usage</h3>
                  <pre className="bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
{`import { SpinnerLoader, FullPageLoader } from '../components/ui/ModernLoader';

// Simple spinner
<SpinnerLoader size="md" color="blue" />

// Full page loader
<FullPageLoader 
  title="Loading..."
  subtitle="Please wait"
  loaderType="gradient"
/>`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Button with Loading State</h3>
                  <pre className="bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
{`import { PrimaryButton } from '../components/ui/ButtonLoader';

<PrimaryButton 
  loading={isLoading}
  loadingText="Saving..."
  onClick={handleSave}
>
  Save Changes
</PrimaryButton>`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skeleton Loading</h3>
                  <pre className="bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
{`import { ProductGridSkeleton } from '../components/ui/SkeletonLoader';

{loading ? (
  <ProductGridSkeleton count={8} />
) : (
  <ProductGrid products={products} />
)}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Performance Benefits</h3>
            <ul className="text-blue-800 space-y-1">
              <li>• <strong>Faster perceived loading:</strong> Users see immediate feedback</li>
              <li>• <strong>Reduced bounce rate:</strong> Engaging animations keep users interested</li>
              <li>• <strong>Better UX:</strong> Clear communication of loading states</li>
              <li>• <strong>Modern feel:</strong> Premium animations make your app stand out</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
