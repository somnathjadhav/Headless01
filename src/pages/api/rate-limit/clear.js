import rateLimiter from '../../../lib/rateLimiter';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Rate limit clearing only available in development' });
  }

  try {
    // Clear all rate limits
    rateLimiter.clearAll();
    
    return res.status(200).json({
      success: true,
      message: 'Rate limits cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing rate limits:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear rate limits',
      error: error.message
    });
  }
}
