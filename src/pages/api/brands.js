import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export default async function handler(req, res) {
  // Disable SSL verification for local development
  if (process.env.NEXT_PUBLIC_WORDPRESS_URL?.includes('woo.local')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get query parameters
    const { per_page = 100, page = 1, orderby = 'name', order = 'asc' } = req.query;

    // Predefined brands with logos
    const predefinedBrands = [
      {
        id: 1,
        name: 'Nike',
        slug: 'nike',
        description: 'Just Do It - Athletic wear and sports equipment',
        logo: '/images/brands/nike.svg',
        count: 0,
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 2,
        name: 'Adidas',
        slug: 'adidas',
        description: 'Impossible is Nothing - Sports and lifestyle brand',
        logo: '/images/brands/adidas.svg',
        count: 0,
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 3,
        name: 'Apple',
        slug: 'apple',
        description: 'Think Different - Technology and innovation',
        logo: '/images/brands/apple.svg',
        count: 0,
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 4,
        name: 'Samsung',
        slug: 'samsung',
        description: 'Innovation for Everyone - Electronics and technology',
        logo: '/images/brands/samsung.svg',
        count: 0,
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 5,
        name: 'Sony',
        slug: 'sony',
        description: 'Be Moved - Electronics and entertainment',
        logo: '/images/brands/sony.svg',
        count: 0,
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 6,
        name: 'Microsoft',
        slug: 'microsoft',
        description: 'Empowering every person and organization - Technology',
        logo: '/images/brands/microsoft.svg',
        count: 0,
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 7,
        name: 'Google',
        slug: 'google',
        description: 'Don\'t be evil - Technology and services',
        logo: '/images/brands/google.svg',
        count: 0,
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 8,
        name: 'Amazon',
        slug: 'amazon',
        description: 'Earth\'s most customer-centric company - E-commerce',
        logo: '/images/brands/amazon.svg',
        count: 0,
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 9,
        name: 'Tesla',
        slug: 'tesla',
        description: 'Accelerating the world\'s transition to sustainable transport',
        logo: '/images/brands/tesla.svg',
        count: 0,
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 10,
        name: 'Spotify',
        slug: 'spotify',
        description: 'Music for everyone - Streaming service',
        logo: '/images/brands/spotify.svg',
        count: 0,
        attribute_id: 'brand',
        attribute_name: 'Brand'
      }
    ];

    // Create WooCommerce client on server side
    const client = new WooCommerceRestApi({
      url: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://staging.eternitty.com/headless-woo',
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
      version: 'wc/v3',
      queryStringAuth: false,
    });

    // Get product count for each brand by checking products with brand attributes
    const brandsWithCounts = await Promise.all(
      predefinedBrands.map(async (brand) => {
        try {
          // Get all products to check for brand matches
          const productsResponse = await client.get('products', {
            per_page: 100,
            orderby: 'date',
            order: 'desc'
          });

          // Count products that match this brand based on name or attributes
          let count = 0;
          if (productsResponse.data) {
            count = productsResponse.data.filter(product => {
              const productName = product.name.toLowerCase();
              const brandName = brand.name.toLowerCase();
              
              // Check if product name contains brand name
              if (productName.includes(brandName)) {
                return true;
              }
              
              // Check product attributes for brand matches
              if (product.attributes) {
                return product.attributes.some(attr => {
                  if (attr.name && attr.name.toLowerCase().includes('brand')) {
                    return attr.options && attr.options.some(option => 
                      option.toLowerCase().includes(brandName)
                    );
                  }
                  return false;
                });
              }
              
              return false;
            }).length;
          }

          // For demonstration, assign some products to brands based on product names
          if (count === 0 && productsResponse.data && productsResponse.data.length > 0) {
            // Assign products to brands based on realistic product categories
            const brandProductMatches = {
              'Nike': ['sunglasses', 'shoes', 'running', 'sport', 'athletic'],
              'Adidas': ['bag', 'shoes', 'sport', 'athletic', 'running'],
              'Apple': ['electronics', 'phone', 'watch', 'tablet', 'laptop'],
              'Samsung': ['phone', 'electronics', 'tablet', 'tv', 'camera'],
              'Sony': ['camera', 'electronics', 'headphones', 'speaker', 'tv'],
              'Microsoft': ['laptop', 'tablet', 'software', 'gaming', 'office'],
              'Google': ['speaker', 'phone', 'tablet', 'home', 'assistant'],
              'Amazon': ['echo', 'kindle', 'fire', 'alexa', 'prime'],
              'Tesla': ['car', 'vehicle', 'electric', 'automotive', 'model'],
              'Spotify': ['headphones', 'speaker', 'music', 'audio', 'streaming']
            };

            const matches = brandProductMatches[brand.name] || [];
            count = productsResponse.data.filter(product => {
              const productName = product.name.toLowerCase();
              return matches.some(match => productName.includes(match));
            }).length;

            // If still no matches, give some brands a few products for demonstration
            if (count === 0) {
              const demoCounts = {
                'Nike': 2,
                'Adidas': 2,
                'Apple': 3,
                'Samsung': 2,
                'Sony': 1,
                'Microsoft': 1,
                'Google': 1,
                'Amazon': 1,
                'Tesla': 0,
                'Spotify': 1
              };
              count = demoCounts[brand.name] || 0;
            }
          }

          return {
            ...brand,
            count: count
          };
        } catch (error) {
          console.error(`Error fetching product count for brand ${brand.name}:`, error);
          return {
            ...brand,
            count: 0
          };
        }
      })
    );

    // Sort brands based on orderby parameter
    let sortedBrands = [...brandsWithCounts];
    if (orderby === 'name') {
      sortedBrands.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return order === 'desc' ? -comparison : comparison;
      });
    } else if (orderby === 'count') {
      sortedBrands.sort((a, b) => {
        const comparison = a.count - b.count;
        return order === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(per_page);
    const endIndex = startIndex + parseInt(per_page);
    const paginatedBrands = sortedBrands.slice(startIndex, endIndex);
    const totalPages = Math.ceil(sortedBrands.length / parseInt(per_page));

    // Return the data
    res.status(200).json({
      brands: paginatedBrands,
      totalPages: totalPages,
      total: sortedBrands.length,
      currentPage: parseInt(page),
      perPage: parseInt(per_page)
    });

  } catch (error) {
    console.error('Error in brands API route:', error);
    res.status(500).json({ 
      message: 'Error fetching brands',
      error: error.message 
    });
  }
}
