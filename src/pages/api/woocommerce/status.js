// Removed getWordPressData import - using direct fetch instead

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Test WooCommerce API connection by fetching system status
    const wcStatus = await getWordPressData('/wp-json/wc/v3/system_status');
    
    if (wcStatus && wcStatus.environment) {
      return res.status(200).json({
        success: true,
        message: 'WooCommerce API is connected and working',
        connected: true,
        version: wcStatus.environment.version,
        environment: wcStatus.environment.environment,
        database_version: wcStatus.database.database_version
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'WooCommerce API is not responding',
        connected: false
      });
    }
  } catch (error) {
    console.error('Error checking WooCommerce status:', error);
    
    // Check if it's a 401/403 error (authentication issue)
    if (error.message.includes('401') || error.message.includes('403')) {
      return res.status(200).json({
        success: false,
        message: 'WooCommerce API authentication failed',
        connected: false,
        error: 'Authentication required'
      });
    }
    
    return res.status(200).json({
      success: false,
      message: 'WooCommerce API is not available',
      connected: false,
      error: error.message
    });
  }
}
