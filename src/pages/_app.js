import '../styles/globals.css';
import '../styles/blog.css';
import { WooCommerceProvider } from '../context/WooCommerceContext';
import { TypographyProvider } from '../context/TypographyContext';
import { AuthProvider } from '../context/AuthContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { NotificationProvider } from '../context/NotificationContext';
import DynamicFavicon from '../components/ui/DynamicFavicon';
import DynamicGoogleFonts from '../components/ui/DynamicGoogleFonts';
import Layout from '../components/layout/Layout';
import WordPressStorageSync from '../components/WordPressStorageSync';
import TypographyPreview from '../components/TypographyPreview';

/**
 * Main App Component
 */
function MyApp({ Component, pageProps, router }) {
  // Check if this is a blog detail page that should bypass the global layout
  const isBlogDetailPage = router.pathname === '/blog/[slug]';
  
  return (
    <TypographyProvider>
      <AuthProvider>
        <WooCommerceProvider>
          <CurrencyProvider>
            <NotificationProvider>
              <DynamicFavicon />
              <DynamicGoogleFonts />
              <WordPressStorageSync />
              <TypographyPreview />
              {isBlogDetailPage ? (
                <Component {...pageProps} />
              ) : (
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              )}
            </NotificationProvider>
          </CurrencyProvider>
        </WooCommerceProvider>
      </AuthProvider>
    </TypographyProvider>
  );
}

export default MyApp;
