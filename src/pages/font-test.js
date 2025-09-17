import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function FontTest() {
  return (
    <>
      <Head>
        <title>Font Test - Suggested Fonts</title>
        <meta name="description" content="Test page for suggested fonts" />
      </Head>

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Font Test Page</h1>
            <p className="text-lg text-gray-600">Testing the suggested fonts: Instrument Sans, Nunito Sans, and JetBrains Mono</p>
          </div>

          {/* Font Examples */}
          <div className="space-y-8">
            {/* Primary Font - Instrument Sans */}
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Primary Font: Instrument Sans</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Headings</h3>
                  <h1 className="text-4xl font-bold mb-2">H1: The quick brown fox jumps over the lazy dog</h1>
                  <h2 className="text-3xl font-semibold mb-2">H2: The quick brown fox jumps over the lazy dog</h2>
                  <h3 className="text-2xl font-semibold mb-2">H3: The quick brown fox jumps over the lazy dog</h3>
                  <h4 className="text-xl font-semibold mb-2">H4: The quick brown fox jumps over the lazy dog</h4>
                  <h5 className="text-lg font-semibold mb-2">H5: The quick brown fox jumps over the lazy dog</h5>
                  <h6 className="text-base font-semibold mb-2">H6: The quick brown fox jumps over the lazy dog</h6>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Body Text</h3>
                  <p className="text-base mb-2">
                    This is body text using Instrument Sans. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
                    quis nostrud exercitation ullamco laboris.
                  </p>
                  <p className="text-sm mb-2">
                    This is smaller text using Instrument Sans. The font should be clean, readable, and modern.
                  </p>
                </div>
              </div>
            </section>

            {/* Secondary Font - Nunito Sans */}
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Secondary Font: Nunito Sans</h2>
              <div className="space-y-4">
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-lg">
                  "This is a blockquote using Nunito Sans. It should have a different feel from the primary font, 
                  being more rounded and friendly. Perfect for quotes, emphasis, and secondary content."
                </blockquote>
                <div className="bg-gray-100 p-4 rounded">
                  <p className="italic">
                    This is italic text using Nunito Sans. It should appear more rounded and friendly 
                    compared to the primary Instrument Sans font.
                  </p>
                </div>
              </div>
            </section>

            {/* Mono Font - JetBrains Mono */}
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Mono Font: JetBrains Mono</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Code Examples</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
                    <code>
{`// This is code using JetBrains Mono
function resetFonts() {
  const primaryFont = "Instrument Sans";
  const secondaryFont = "Nunito Sans";
  const monoFont = "JetBrains Mono";
  
  console.log("Fonts reset successfully!");
}`}
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Inline Code</h3>
                  <p className="text-base">
                    This paragraph contains <code className="bg-gray-200 px-2 py-1 rounded">inline code</code> 
                    using JetBrains Mono. The font should be monospaced and easy to read for code.
                  </p>
                </div>
              </div>
            </section>

            {/* Font Weights Test */}
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Font Weights Test</h2>
              <div className="space-y-2">
                <p className="font-light">Light (300): The quick brown fox jumps over the lazy dog</p>
                <p className="font-normal">Normal (400): The quick brown fox jumps over the lazy dog</p>
                <p className="font-medium">Medium (500): The quick brown fox jumps over the lazy dog</p>
                <p className="font-semibold">Semibold (600): The quick brown fox jumps over the lazy dog</p>
                <p className="font-bold">Bold (700): The quick brown fox jumps over the lazy dog</p>
              </div>
            </section>

            {/* Navigation Test */}
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Navigation & UI Elements</h2>
              <div className="space-y-4">
                <nav className="flex space-x-4">
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Home</a>
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Products</a>
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">About</a>
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Contact</a>
                </nav>
                <div className="flex space-x-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Primary Button
                  </button>
                  <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
                    Secondary Button
                  </button>
                </div>
                <form className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea 
                    placeholder="Enter your message" 
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
