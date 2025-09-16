export default async function handler(req, res) {
  // Only allow in development or for testing
  if (process.env.NODE_ENV === 'production' && !req.query.debug) {
    return res.status(403).json({ message: 'Not allowed in production' });
  }

  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? 'SET' : 'NOT SET',
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_WORDPRESS_URL: process.env.NEXT_PUBLIC_WORDPRESS_URL,
    // Check if it's detected as local development
    isLocalDevelopment: process.env.NODE_ENV === 'development' || 
                       process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost') ||
                       process.env.NEXT_PUBLIC_SITE_URL?.includes('127.0.0.1') ||
                       !process.env.NEXT_PUBLIC_SITE_URL
  };

  res.status(200).json({
    success: true,
    environment: envCheck,
    message: 'Environment variables check'
  });
}
