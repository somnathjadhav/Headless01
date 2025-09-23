# Legal Pages Template Guide

## ✅ Fixed Issue: Duplicate Header/Footer

The issue where legal pages were showing header and footer twice has been **FIXED**.

### Problem
- Legal pages were using `<Layout>` component which already includes header and footer
- Page content was wrapped in additional layout structure causing duplication

### Solution
- Removed the outer `<div className="min-h-screen bg-gray-50">` wrapper
- Content now renders directly within the Layout component
- Header and footer appear only once

## 📋 Template for Future Legal Pages

### Option 1: Use the Reusable Template (Recommended)

```javascript
import React from 'react';
import LegalPageTemplate from '../../components/legal/LegalPageTemplate';

export default function MyLegalPage() {
  const pageData = {
    title: "Page Title",
    excerpt: "Page description",
    content: "<p>Page content HTML</p>",
    modified: new Date().toISOString()
  };

  return <LegalPageTemplate {...pageData} />;
}
```

### Option 2: Manual Implementation

```javascript
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';

export default function MyLegalPage() {
  const router = useRouter();

  return (
    <Layout>
      <Head>
        <title>Page Title - Your WordPress Site</title>
        <meta name="description" content="Page description" />
      </Head>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Page Title
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Page description
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </Layout>
  );
}
```

## 🚫 What NOT to Do

### ❌ Don't wrap content in additional layout containers:

```javascript
// WRONG - This causes duplicate headers/footers
<Layout>
  <div className="min-h-screen bg-gray-50">  {/* ❌ Remove this */}
    <div className="bg-white border-b border-gray-200">
      {/* content */}
    </div>
  </div>
</Layout>
```

### ❌ Don't create your own header/footer:

```javascript
// WRONG - Layout already includes these
<Layout>
  <header>...</header>  {/* ❌ Remove this */}
  <main>...</main>      {/* ❌ Remove this */}
  <footer>...</footer>  {/* ❌ Remove this */}
</Layout>
```

## ✅ What TO Do

### ✅ Use Layout component properly:

```javascript
// CORRECT - Let Layout handle header/footer
<Layout>
  <Head>
    <title>Page Title - Your WordPress Site</title>
  </Head>
  
  {/* Direct content without extra wrappers */}
  <div className="bg-white border-b border-gray-200">
    {/* content */}
  </div>
</Layout>
```

## 📁 File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.js          # Main layout with header/footer
│   │   ├── Header.js          # Site header
│   │   └── Footer.js          # Site footer
│   └── legal/
│       └── LegalPageTemplate.js  # Reusable legal page template
├── pages/
│   └── legal/
│       ├── [slug].js          # Dynamic legal pages
│       └── test.js            # Test legal page
└── hooks/
    └── usePageContent.js      # Hook for fetching page content
```

## 🎯 Key Points

1. **Always use `<Layout>` component** - it handles header/footer automatically
2. **Don't wrap content in additional layout containers** - causes duplication
3. **Use the reusable `LegalPageTemplate`** for consistency
4. **Content renders directly within Layout** - no extra wrappers needed
5. **SEO meta tags go in `<Head>`** - within the Layout component

## 🔧 Testing

To test if a page has duplicate headers/footers:

```bash
curl -s "http://localhost:3000/your-page" | grep -c "header\|footer"
```

- Should return `2` (one header, one footer)
- If it returns more than `2`, there are duplicates

## 📝 Current Status

✅ **Fixed**: All existing legal pages no longer show duplicate headers/footers
✅ **Template**: Reusable template created for future pages
✅ **Documentation**: This guide prevents future issues
✅ **Testing**: Verified pages work correctly
