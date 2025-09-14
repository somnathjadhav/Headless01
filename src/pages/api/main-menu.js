/**
 * Main Menu API Endpoint
 * 
 * Fetches the WordPress main menu from the backend
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const wordpressUrl = 'http://localhost:10008'
    
    // Try to fetch main menu from WordPress Headless Pro plugin (enhanced endpoint)
    const response = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/menus-enhanced`, {
      headers: {
        'Accept': 'application/json',
      },
    }).catch(error => {
      console.log('Enhanced endpoint failed, trying original:', error.message);
      return null;
    })

    if (response && response.ok) {
      const menus = await response.json()
      
      // Look for main menu by name/slug
      const mainMenuNames = ['main-menu', 'primary', 'main', 'header', 'primary-menu', 'header-menu']
      let mainMenu = null
      
      // First, try to find main menu by name
      for (const menuName of mainMenuNames) {
        if (menus[menuName] && menus[menuName].items && menus[menuName].items.length > 0) {
          mainMenu = menus[menuName]
          break
        }
      }
      
      // If no main menu found by name, try to get the first available menu
      if (!mainMenu) {
        const menuKeys = Object.keys(menus)
        if (menuKeys.length > 0) {
          mainMenu = menus[menuKeys[0]]
        }
      }
      
      if (mainMenu) {
        // Process menu items to include all levels and maintain WordPress order
        // Convert WordPress URLs to frontend URLs
        const processedItems = (mainMenu.items || []).map(item => {
          let frontendUrl = item.url;
          
          // Convert WordPress URLs to frontend URLs
          if (item.url.includes('/shop/')) {
            frontendUrl = '/products';
          } else if (item.url.includes('/product-category/')) {
            // Extract category slug from WordPress URL
            const categorySlug = item.url.match(/\/product-category\/([^\/]+)\//)?.[1];
            if (categorySlug) {
              // Map WordPress category slugs to actual category slugs
              let actualCategorySlug = categorySlug;
              if (categorySlug === 'men') actualCategorySlug = 'men';
              if (categorySlug === 'women') actualCategorySlug = 'women';
              if (categorySlug === 'kids') actualCategorySlug = 'kids';
              
              frontendUrl = `/products?category=${actualCategorySlug}`;
            }
          } else if (item.url.includes('/contact-us/')) {
            frontendUrl = '/contact';
          } else if (item.url.includes('/about-us/')) {
            frontendUrl = '/about';
          } else if (item.url.includes('/blog/')) {
            frontendUrl = '/blog';
          }
          
          return {
            id: item.id,
            title: item.title,
            url: frontendUrl,
            target: item.target || '_self',
            description: item.description || '',
            children: item.children || [],
            order: item.menu_order || 0
          };
        });
        
        const processedMenu = {
          location: mainMenu.slug,
          description: mainMenu.description,
          items: processedItems
        }
        
        return res.status(200).json({
          success: true,
          data: processedMenu,
          source: 'wordpress-plugin'
        })
      }
    }
    
    // Fallback: Try original menu endpoint
    const fallbackResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/menus`, {
      headers: {
        'Accept': 'application/json',
      },
    }).catch(() => null)
    
    if (fallbackResponse && fallbackResponse.ok) {
      const menus = await fallbackResponse.json()
      
      // Look for main menu by location
      const mainMenuLocations = ['primary', 'main', 'header', 'top', 'primary-menu', 'main-menu', 'header-menu']
      let mainMenu = null
      
      for (const location of mainMenuLocations) {
        if (menus[location] && menus[location].items && menus[location].items.length > 0) {
          mainMenu = menus[location]
          break
        }
      }
      
      if (mainMenu) {
        const processedMenu = {
          location: mainMenu.location,
          description: mainMenu.description,
          items: processMenuItems(mainMenu.items || [])
        }
        
        return res.status(200).json({
          success: true,
          data: processedMenu,
          source: 'wordpress-plugin-fallback'
        })
      }
    }

    // If WordPress menu API is not available, try to build menu from WordPress pages and categories
    try {
      const [pagesResponse, categoriesResponse] = await Promise.all([
        fetch(`${wordpressUrl}/wp-json/wp/v2/pages?per_page=100`),
        fetch(`${wordpressUrl}/wp-json/wp/v2/categories?per_page=100`)
      ])

      if (pagesResponse.ok && categoriesResponse.ok) {
        const pages = await pagesResponse.json()
        const categories = await categoriesResponse.json()
        
        // DYNAMIC MENU: Build menu dynamically from WordPress pages and categories
        // This will automatically reflect any changes made in WordPress admin
        const menuItems = [];
        
        // Get all pages and categories that should be in the main menu
        // This creates a dynamic menu that updates automatically when WordPress content changes
        
        // 1. Add Shop page (always first)
        const shopPage = pages.find(p => p.slug === 'shop');
        if (shopPage) {
          menuItems.push({
            id: shopPage.id,
            title: 'Shop',
            url: '/products',
            target: '_self',
            description: 'Shop Page',
            children: [],
            order: 1,
            type: 'page'
          });
        }
        
        // 2. Add product categories (dynamically from WordPress)
        const productCategories = categories.filter(cat => 
          cat.slug !== 'uncategorized' && 
          cat.count > 0 && // Only categories with products
          !cat.slug.includes('fashion-trends') && // Exclude blog categories
          !cat.slug.includes('street-style') &&
          !cat.slug.includes('sustainable-fashion') &&
          !cat.slug.includes('vintage-fashion')
        );
        
        // Sort categories by product count (most products first)
        productCategories.sort((a, b) => b.count - a.count);
        
        productCategories.forEach((category, index) => {
          let displayTitle = category.name;
          
          // Customize display names for better UX
          if (category.slug === 'mens-fashion') displayTitle = 'Men';
          if (category.slug === 'womens-fashion') displayTitle = 'Women';
          if (category.slug === 'beauty-makeup') displayTitle = 'Beauty & Makeup';
          
          menuItems.push({
            id: category.id,
            title: displayTitle,
            url: `/products?category=${category.slug}`,
            target: '_self',
            description: `${displayTitle} Category`,
            children: [],
            order: index + 2, // Start after Shop
            type: 'category'
          });
        });
        
        // 3. Add important pages (Contact Us, About Us, etc.)
        const importantPages = ['contact-us', 'about-us', 'blog'];
        importantPages.forEach((pageSlug, index) => {
          const page = pages.find(p => p.slug === pageSlug);
          if (page) {
            menuItems.push({
              id: page.id,
              title: page.title.rendered,
              url: `/${pageSlug === 'contact-us' ? 'contact' : pageSlug === 'about-us' ? 'about' : pageSlug}`,
              target: '_self',
              description: `${page.title.rendered} Page`,
              children: [],
              order: menuItems.length + 1,
              type: 'page'
            });
          }
        });
        
        const wordpressMenu = {
          location: 'primary',
          description: 'Main Menu',
          items: menuItems
        }

        return res.status(200).json({
          success: true,
          data: wordpressMenu,
          source: 'wordpress-reconstructed'
        })
      }
    } catch (error) {
      console.log('Could not fetch WordPress pages/categories:', error.message)
    }

    // If no main menu found, return a default menu structure
    const defaultMenu = {
      location: 'primary',
      description: 'Main Menu',
      items: [
        {
          id: 'home',
          title: 'Home',
          url: '/',
          target: '_self',
          description: 'Home page',
          children: []
        },
        {
          id: 'products',
          title: 'Shop',
          url: '/products',
          target: '_self',
          description: 'All products',
          children: [
            {
              id: 'all-products',
              title: 'All Products',
              url: '/products',
              target: '_self',
              description: 'Browse all products',
              children: []
            },
            {
              id: 'categories',
              title: 'Categories',
              url: '/categories',
              target: '_self',
              description: 'Product categories',
              children: []
            },
            {
              id: 'new-arrivals',
              title: 'New Arrivals',
              url: '/products?filter=new',
              target: '_self',
              description: 'Latest products',
              children: []
            }
          ]
        },
        {
          id: 'pages',
          title: 'Pages',
          url: '/pages',
          target: '_self',
          description: 'Site pages',
          children: [
            {
              id: 'about',
              title: 'About Us',
              url: '/about',
              target: '_self',
              description: 'About our company',
              children: []
            },
            {
              id: 'contact',
              title: 'Contact Us',
              url: '/contact',
              target: '_self',
              description: 'Get in touch',
              children: []
            }
          ]
        },
        {
          id: 'blog',
          title: 'Blog',
          url: '/blog',
          target: '_self',
          description: 'Latest blog posts',
          children: []
        }
      ]
    }

    return res.status(200).json({
      success: true,
      data: defaultMenu,
      source: 'default'
    })

  } catch (error) {
    console.error('Error fetching main menu:', error)
    
    // Return default menu on error
    const defaultMenu = {
      location: 'primary',
      description: 'Main Menu',
      items: [
        {
          id: 'home',
          title: 'Home',
          url: '/',
          target: '_self',
          description: 'Home page',
          children: []
        },
        {
          id: 'products',
          title: 'Shop',
          url: '/products',
          target: '_self',
          description: 'All products',
          children: []
        },
        {
          id: 'blog',
          title: 'Blog',
          url: '/blog',
          target: '_self',
          description: 'Latest blog posts',
          children: []
        }
      ]
    }

    return res.status(200).json({
      success: true,
      data: defaultMenu,
      source: 'fallback'
    })
  }
}

/**
 * Process menu items to include all levels (children)
 */
function processMenuItems(items) {
  return items.map(item => ({
    id: item.id,
    title: item.title,
    url: item.url,
    target: item.target || '_self',
    description: item.description || '',
    children: item.children || []
  }))
}
