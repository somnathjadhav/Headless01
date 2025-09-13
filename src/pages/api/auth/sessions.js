export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user information from headers (passed from frontend)
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];
    
    if (!userId || !userEmail) {
      return res.status(401).json({ error: 'Unauthorized - User information required' });
    }

    // For now, we'll return mock session data
    // In a real implementation, you would store and retrieve session data from a database
    const mockSessions = [
      {
        id: 'current-session',
        isCurrent: true,
        userAgent: req.headers['user-agent'] || 'Unknown',
        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown',
        location: 'Current Location',
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'session-2',
        isCurrent: false,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ipAddress: '192.168.1.100',
        location: 'Home Network',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        id: 'session-3',
        isCurrent: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        ipAddress: '10.0.0.50',
        location: 'Mobile Network',
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
      }
    ];

    return res.status(200).json({
      success: true,
      sessions: mockSessions
    });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch sessions' 
    });
  }
}