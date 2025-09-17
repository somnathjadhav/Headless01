/**
 * Typography Management API
 * Allows managing typography settings locally without requiring WordPress plugin
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Typography Management API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

// Get current typography settings
async function handleGet(req, res) {
  try {
    // For now, return the default typography settings
    // In a real implementation, this could read from a database or file
    const defaultTypography = {
      fonts: {
        primary: {
          family: 'Instrument Sans',
          fallback: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          weights: [400, 500, 600, 700],
          google: true
        },
        secondary: {
          family: 'Nunito Sans',
          fallback: 'Georgia, "Times New Roman", serif',
          weights: [400, 500, 600, 700],
          google: true
        },
        mono: {
          family: 'JetBrains Mono',
          fallback: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          weights: [400, 500],
          google: true
        }
      },
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem'
      },
      headings: {
        h1: { size: '4xl', weight: 700, lineHeight: 1.1, letterSpacing: '-0.025em' },
        h2: { size: '3xl', weight: 600, lineHeight: 1.2, letterSpacing: '-0.025em' },
        h3: { size: '2xl', weight: 600, lineHeight: 1.3, letterSpacing: '-0.025em' },
        h4: { size: 'xl', weight: 600, lineHeight: 1.4, letterSpacing: '-0.025em' },
        h5: { size: 'lg', weight: 600, lineHeight: 1.5, letterSpacing: '-0.025em' },
        h6: { size: 'base', weight: 600, lineHeight: 1.5, letterSpacing: '-0.025em' }
      },
      body: {
        size: 'base',
        weight: 400,
        lineHeight: 1.6,
        letterSpacing: '0em'
      },
      buttons: {
        small: { size: 'sm', weight: 500, lineHeight: 1.4 },
        medium: { size: 'base', weight: 500, lineHeight: 1.4 },
        large: { size: 'lg', weight: 500, lineHeight: 1.4 }
      },
      colors: {
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          muted: '#9CA3AF',
          inverse: '#FFFFFF'
        },
        headings: {
          primary: '#111827',
          secondary: '#374151',
          accent: '#3B82F6'
        }
      },
      spacing: {
        lineHeight: {
          tight: 1.25,
          snug: 1.375,
          normal: 1.5,
          relaxed: 1.625,
          loose: 2
        },
        letterSpacing: {
          tighter: '-0.05em',
          tight: '-0.025em',
          normal: '0em',
          wide: '0.025em',
          wider: '0.05em',
          widest: '0.1em'
        }
      }
    };

    return res.status(200).json({
      typography: defaultTypography,
      source: 'local',
      timestamp: new Date().toISOString(),
      message: 'Typography settings retrieved successfully'
    });

  } catch (error) {
    console.error('Error in handleGet:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve typography settings',
      error: error.message 
    });
  }
}

// Create new typography settings
async function handlePost(req, res) {
  try {
    const { typography } = req.body;

    if (!typography) {
      return res.status(400).json({ 
        message: 'Typography settings are required' 
      });
    }

    // In a real implementation, this would save to a database or file
    // For now, we'll just return success
    console.log('📝 New typography settings received:', typography);

    return res.status(201).json({
      message: 'Typography settings saved successfully',
      typography: typography,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in handlePost:', error);
    return res.status(500).json({ 
      message: 'Failed to save typography settings',
      error: error.message 
    });
  }
}

// Update existing typography settings
async function handlePut(req, res) {
  try {
    const { typography } = req.body;

    if (!typography) {
      return res.status(400).json({ 
        message: 'Typography settings are required' 
      });
    }

    // In a real implementation, this would update in a database or file
    console.log('📝 Typography settings updated:', typography);

    return res.status(200).json({
      message: 'Typography settings updated successfully',
      typography: typography,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in handlePut:', error);
    return res.status(500).json({ 
      message: 'Failed to update typography settings',
      error: error.message 
    });
  }
}

// Delete typography settings (reset to defaults)
async function handleDelete(req, res) {
  try {
    // In a real implementation, this would delete from a database or file
    console.log('🗑️ Typography settings reset to defaults');

    return res.status(200).json({
      message: 'Typography settings reset to defaults successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in handleDelete:', error);
    return res.status(500).json({ 
      message: 'Failed to reset typography settings',
      error: error.message 
    });
  }
}

