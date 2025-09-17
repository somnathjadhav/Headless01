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
    const { slug } = req.query;
    const { per_page = 12, page = 1, orderby = 'date', order = 'desc' } = req.query;

    // Predefined brands data
    const predefinedBrands = [
      {
        id: 1,
        name: 'Nike',
        slug: 'nike',
        description: 'Just Do It - Athletic wear and sports equipment',
        logo: '/images/brands/nike.svg',
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 2,
        name: 'Adidas',
        slug: 'adidas',
        description: 'Impossible is Nothing - Sports and lifestyle brand',
        logo: '/images/brands/adidas.svg',
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 3,
        name: 'Apple',
        slug: 'apple',
        description: 'Think Different - Technology and innovation',
        logo: '/images/brands/apple.svg',
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 4,
        name: 'Samsung',
        slug: 'samsung',
        description: 'Innovation for Everyone - Electronics and technology',
        logo: '/images/brands/samsung.svg',
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 5,
        name: 'Sony',
        slug: 'sony',
        description: 'Be Moved - Electronics and entertainment',
        logo: '/images/brands/sony.svg',
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 6,
        name: 'Microsoft',
        slug: 'microsoft',
        description: 'Empowering every person and organization - Technology',
        logo: '/images/brands/microsoft.svg',
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 7,
        name: 'Google',
        slug: 'google',
        description: 'Don\'t be evil - Technology and services',
        logo: '/images/brands/google.svg',
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 8,
        name: 'Amazon',
        slug: 'amazon',
        description: 'Earth\'s most customer-centric company - E-commerce',
        logo: '/images/brands/amazon.svg',
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 9,
        name: 'Tesla',
        slug: 'tesla',
        description: 'Accelerating the world\'s transition to sustainable transport',
        logo: '/images/brands/tesla.svg',
        attribute_id: 'brand',
        attribute_name: 'Brand'
      },
      {
        id: 10,
        name: 'Spotify',
        slug: 'spotify',
        description: 'Music for everyone - Streaming service',
        logo: '/images/brands/spotify.svg',
        attribute_id: 'brand',
        attribute_name: 'Brand'
      }
    ];

    // Find the brand by slug
    const brand = predefinedBrands.find(b => b.slug === slug);
    
    if (!brand) {
      return res.status(404).json({ 
        message: 'Brand not found',
        error: 'Brand not found' 
      });
    }

    // Create WooCommerce client
    const client = new WooCommerceRestApi({
      url: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://staging.eternitty.com/headless-woo',
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
      version: 'wc/v3',
      queryStringAuth: false,
    });

    // Get all products to filter by brand
    const productsResponse = await client.get('products', {
      per_page: 100,
      orderby: orderby || 'date',
      order: order || 'desc',
    });

    // Filter products that match this brand
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
    let brandProducts = [];

    if (productsResponse.data) {
      brandProducts = productsResponse.data.filter(product => {
        const productName = product.name.toLowerCase();
        const brandName = brand.name.toLowerCase();
        
        // Check if product name contains brand name
        if (productName.includes(brandName)) {
          return true;
        }
        
        // Check product attributes for brand matches
        if (product.attributes) {
          const hasBrandAttribute = product.attributes.some(attr => {
            if (attr.name && attr.name.toLowerCase().includes('brand')) {
              return attr.options && attr.options.some(option => 
                option.toLowerCase().includes(brandName)
              );
            }
            return false;
          });
          if (hasBrandAttribute) return true;
        }
        
        // Check category-based matching
        return matches.some(match => productName.includes(match));
      });
    }

    // For demonstration, if no products found, create some sample products
    if (brandProducts.length === 0) {
      const demoProducts = {
        'Nike': [
          { id: 1001, name: 'Nike Air Max 270', price: '120.00', regular_price: '120.00', sale_price: '', images: [{ src: '/placeholder-product.svg' }] },
          { id: 1002, name: 'Nike Dri-FIT T-Shirt', price: '25.00', regular_price: '25.00', sale_price: '', images: [{ src: '/placeholder-product.svg' }] }
        ],
        'Adidas': [
          { id: 2001, name: 'Adidas Ultraboost 22', price: '180.00', regular_price: '180.00', sale_price: '', images: [{ src: '/placeholder-product.svg' }] },
          { id: 2002, name: 'Adidas Originals Backpack', price: '45.00', regular_price: '45.00', sale_price: '', images: [{ src: '/placeholder-product.svg' }] }
        ],
        'Apple': [
          { id: 3001, name: 'iPhone 14 Pro', price: '999.00', regular_price: '999.00', sale_price: '', images: [{ src: '/placeholder-product.svg' }] },
          { id: 3002, name: 'MacBook Air M2', price: '1199.00', regular_price: '1199.00', sale_price: '', images: [{ src: '/placeholder-product.svg' }] },
          { id: 3003, name: 'Apple Watch Series 8', price: '399.00', regular_price: '399.00', sale_price: '', images: [{ src: '/placeholder-product.svg' }] }
        ],
        'Samsung': [
          { id: 4001, name: 'Samsung Galaxy S23', price: '799.00', regular_price: '799.00', sale_price: '', images: [{ src: '/placeholder-product.svg' }] },
          { id: 4002, name: 'Samsung 4K Smart TV', price: '599.00', regular_price: '599.00', sale_price: '', images: [{ src: '/placeholder-product.svg' }] }
        ],
        'Sony': [
          { id: 5001, name: 'Sony WH-1000XM5 Headphones', price: '399.00', regular_price: '399.00', sale_price: '', images: [{ src: '/placeholder-product.svg' }] }
        ],
        'Microsoft': [
          { id: 6001, name: 'Surface Laptop 5', price: '999.00', regular_price: '999.00', sale_price: '', images: [{ src: '/placeholder-product.svg' }] }
        ],
        'Google': [
          { id: 7001, name: 'Google Pixel 7', price: '599.00', regular_price: '599.00', sale_price: '', images: [{ src: '/placeholder-product.svg' }] }
        ],
        'Amazon': [
          { id: 8001, name: 'Amazon Echo Dot', price: '49.99', regular_price: '49.99', sale_price: '', images: [{ src: '/placeholder-product.svg' }] }
        ],
        'Tesla': [],
        'Spotify': [
          { id: 10001, name: 'Spotify Premium Subscription', price: '9.99', regular_price: '9.99', sale_price: '', images: [{ src: '/placeholder-product.svg' }] }
        ]
      };

      brandProducts = demoProducts[brand.name] || [];
    }

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(per_page);
    const endIndex = startIndex + parseInt(per_page);
    const paginatedProducts = brandProducts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(brandProducts.length / parseInt(per_page));

    // Return the data
    res.status(200).json({
      brand: brand,
      products: paginatedProducts,
      totalPages: totalPages,
      total: brandProducts.length,
      currentPage: parseInt(page),
      perPage: parseInt(per_page)
    });

  } catch (error) {
    console.error('Error in brand products API route:', error);
    res.status(500).json({ 
      message: 'Error fetching brand products',
      error: error.message 
    });
  }
}