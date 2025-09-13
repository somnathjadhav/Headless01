import Header from './Header'
import Footer from './Footer'
import SEO from './SEO'
import GoToTop from '../ui/GoToTop'
import ErrorBoundary from '../ui/ErrorBoundary'
import NotificationDisplay from '../ui/NotificationDisplay'

export default function Layout({ children }) {
  return (
    <ErrorBoundary>
      <SEO />
      <Header />
      <main>{children}</main>
      <Footer />
      <GoToTop />
      <NotificationDisplay />
    </ErrorBoundary>
  )
}
