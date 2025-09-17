export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock 2FA disable for now
    // In a real implementation, this would disable 2FA for the user
    console.log('Disabling 2FA for user');

    return res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}
