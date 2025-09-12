import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon Configuration - Dynamic from WordPress API */}
        <link rel="icon" href="/api/favicon" type="image/png" />
        <meta name="favicon-source" content="WordPress API - Dynamic" />
        
        {/* Meta Tags */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        
        {/* Preconnect to WordPress Backend */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://staging.eternitty.com/headless-woo'} />
        
        {/* Fonts - Preconnect for dynamic loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
