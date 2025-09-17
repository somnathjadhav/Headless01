import TypographyColorCard from '../components/ui/TypographyColorCard';
import Head from 'next/head';

export default function TestTypographyPage() {
  return (
    <>
      <Head>
        <title>Test Typography Card | Eternitty Headless WordPress</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Test Typography & Color Card</h1>
          
          <TypographyColorCard />
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Debug Info</h2>
            <p className="text-blue-800 text-sm">
              This page tests the TypographyColorCard component directly. 
              If you can see the card above, it means the component is working correctly.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
