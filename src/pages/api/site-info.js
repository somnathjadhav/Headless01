export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const wordpressUrl = process.env.WORDPRESS_URL || 'https://woo.local';
    
    // Try to get site info from WordPress REST API
    let siteInfo = null;
    
    try {
      // Method 1: Try the custom Headless Pro plugin site info endpoint
      const response = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/site-info`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        siteInfo = await response.json();
        console.log('✅ Found site info from Headless Pro plugin:', siteInfo);
      }
    } catch (error) {
      console.log('⚠️ Could not fetch from Headless Pro plugin:', error.message);
    }
    
    // Method 2: Try the main WordPress site info endpoint
    if (!siteInfo || !siteInfo.name) {
      try {
        const response = await fetch(`${wordpressUrl}/wp-json/`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          siteInfo = await response.json();
          console.log('✅ Found site info from main endpoint:', siteInfo);
        }
      } catch (error) {
        console.log('⚠️ Could not fetch from main endpoint:', error.message);
      }
    }

    // Method 3: Try to get from settings endpoint
    if (!siteInfo || !siteInfo.name) {
      try {
        const settingsResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/settings`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          if (settings.title) {
            siteInfo = {
              name: settings.title,
              description: settings.description || '',
              url: settings.url || wordpressUrl
            };
            console.log('✅ Found site info from settings endpoint:', siteInfo);
          }
        }
      } catch (error) {
        console.log('⚠️ Could not fetch from settings endpoint:', error.message);
      }
    }

    // Method 4: Try GraphQL endpoint
    if (!siteInfo || !siteInfo.name) {
      try {
        const graphqlQuery = {
          query: `
            query GetSiteInfo {
              generalSettings {
                title
                description
                url
              }
            }
          `
        };

        const graphqlResponse = await fetch(`${wordpressUrl}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(graphqlQuery),
        });

        if (graphqlResponse.ok) {
          const graphqlData = await graphqlResponse.json();
          if (graphqlData.data && graphqlData.data.generalSettings) {
            const settings = graphqlData.data.generalSettings;
            siteInfo = {
              name: settings.title,
              description: settings.description || '',
              url: settings.url || wordpressUrl
            };
            console.log('✅ Found site info from GraphQL endpoint:', siteInfo);
          }
        }
      } catch (error) {
        console.log('⚠️ Could not fetch from GraphQL endpoint:', error.message);
      }
    }

    // Fallback to default values
    if (!siteInfo || !siteInfo.name) {
      siteInfo = {
        name: 'Your WordPress Site',
        description: 'A modern WordPress site',
        url: wordpressUrl
      };
      console.log('⚠️ Using fallback site info:', siteInfo);
    }

    return res.status(200).json({
      success: true,
      data: siteInfo
    });

  } catch (error) {
    console.error('Error fetching site info:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch site information',
      data: {
        name: 'Your WordPress Site',
        description: 'A modern WordPress site',
        url: process.env.WORDPRESS_URL || 'https://woo.local'
      }
    });
  }
}
