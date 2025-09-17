import '../styles/globals.css';
import '../styles/blog.css';
import { WooCommerceProvider } from '../context/WooCommerceContext';
import { TypographyProvider } from '../context/TypographyContext';
import { AuthProvider } from '../context/AuthContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { NotificationProvider } from '../context/NotificationContext';
import { ModalProvider } from '../context/ModalContext';
import { ThemeProvider } from '../context/ThemeContext';
import DynamicFavicon from '../components/ui/DynamicFavicon';
import DynamicGoogleFonts from '../components/ui/DynamicGoogleFonts';
import Layout from '../components/layout/Layout';
import WordPressStorageSync from '../components/WordPressStorageSync';
import AuthModal from '../components/modals/AuthModal';
import AuthModalLight from '../components/modals/AuthModalLight';

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
              <ThemeProvider>
                <ModalProvider>
                  <DynamicFavicon />
                  <DynamicGoogleFonts />
                  <WordPressStorageSync />
                  {isBlogDetailPage ? (
                    <Component {...pageProps} />
                  ) : (
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                  )}
                  <AuthModal />
                  <AuthModalLight />
                </ModalProvider>
              </ThemeProvider>
            </NotificationProvider>
          </CurrencyProvider>
        </WooCommerceProvider>
      </AuthProvider>
    </TypographyProvider>
  );
}

export default MyApp;
