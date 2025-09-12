# 🎯 Eternitty Headless WooCommerce Setup Guide

This guide will help you set up your headless WooCommerce project with Faust.js and the custom "Eternitty" theme.

## 🚀 Quick Start

### 1. WordPress Backend Setup

#### Install Required Plugins
1. **WooCommerce** - E-commerce functionality
   - Go to WordPress Admin → Plugins → Add New
   - Search for "WooCommerce"
   - Install and activate

2. **WPGraphQL** - GraphQL API
   - Go to WordPress Admin → Plugins → Add New
   - Search for "WPGraphQL"
   - Install and activate

3. **WPGraphQL for WooCommerce** - WooCommerce GraphQL support
   - Go to WordPress Admin → Plugins → Add New
   - Search for "WPGraphQL for WooCommerce"
   - Install and activate

#### Activate the Eternitty Theme
1. Go to WordPress Admin → Appearance → Themes
2. Find "Eternitty" theme
3. Click "Activate"

#### Configure WooCommerce
1. Complete the WooCommerce setup wizard
2. Add some sample products
3. Configure your store settings

### 2. Frontend Setup

#### Install Dependencies
```bash
cd headless-frontend
npm install
```

#### Environment Configuration
1. Copy `env.local` to `.env.local`
2. Update the WordPress URL in `.env.local`:
   ```bash
   WORDPRESS_URL=https://woo.local  # Update to your WordPress URL
   ```

#### Start Development Server
```bash
npm run dev
```

## 🔧 Configuration

### WordPress Backend
- **URL**: Update in `env.local` file
- **Port**: Default is 10003 (Flywheel Local)
- **SSL**: Configure if needed

### Faust.js Configuration
- **API Secret**: Update in `faust.config.js`
- **Preview Mode**: Configure for WordPress previews
- **Authentication**: Set up login/dashboard paths

### WooCommerce API
- **Consumer Key**: Get from WooCommerce → Settings → Advanced → REST API
- **Consumer Secret**: Get from WooCommerce → Settings → Advanced → REST API

## 📱 Features

### ✅ Implemented
- **Product Display**: Grid layout with filtering
- **Search**: Real-time product search
- **Categories**: Filter by product categories
- **Cart Management**: Add/remove items, quantity control
- **Responsive Design**: Mobile-first approach
- **Performance**: Optimized loading and caching

### 🚧 Coming Soon
- **Checkout Process**: Complete WooCommerce checkout
- **User Accounts**: Customer login/registration
- **Order Management**: Order history and tracking
- **Payment Integration**: Stripe, PayPal, etc.
- **Inventory Management**: Real-time stock updates

## 🛠️ Development

### Project Structure
```
headless-frontend/
├── src/
│   ├── components/
│   │   ├── woocommerce/     # WooCommerce components
│   │   └── ui/             # Reusable UI components
│   ├── context/            # React context providers
│   ├── lib/                # API clients and utilities
│   └── pages/              # Next.js pages
├── faust.config.js         # Faust.js configuration
├── next.config.js          # Next.js configuration
└── env.local               # Environment variables
```

### Key Components
- **ProductCard**: Individual product display
- **ProductFilters**: Category and sorting filters
- **ProductSearch**: Search functionality
- **WooCommerceContext**: State management
- **Faust.js Integration**: WordPress connectivity

### API Endpoints
- **WordPress REST**: `/wp-json/wp/v2/`
- **WooCommerce REST**: `/wp-json/wc/v3/`
- **GraphQL**: `/graphql`
- **Custom**: `/wp-json/eternitty/v1/`

## 🧪 Testing

### WordPress Backend
1. Visit your WordPress admin
2. Check that Eternitty theme is active
3. Verify WooCommerce is working
4. Test GraphQL endpoint at `/graphql`

### Frontend
1. Start development server
2. Visit homepage
3. Check system status indicators
4. Navigate to products page
5. Test search and filtering
6. Test add to cart functionality

## 🐛 Troubleshooting

### Common Issues

#### WordPress Connection Failed
- Check WordPress URL in `env.local`
- Verify WordPress is running
- Check for CORS issues
- Verify SSL certificates

#### WooCommerce Not Active
- Install and activate WooCommerce plugin
- Complete setup wizard
- Check WooCommerce settings

#### Products Not Loading
- Verify WooCommerce REST API is accessible
- Check API keys and secrets
- Verify products are published
- Check browser console for errors

#### GraphQL Issues
- Install WPGraphQL plugin
- Activate WPGraphQL for WooCommerce
- Check GraphQL endpoint at `/graphql`

### Debug Mode
Enable debug mode in `env.local`:
```bash
DEBUG=true
NODE_ENV=development
```

## 📚 Resources

### Documentation
- [Faust.js Documentation](https://faustjs.org/)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [WPGraphQL Documentation](https://docs.wpgraphql.com/)
- [Next.js Documentation](https://nextjs.org/docs)

### Support
- [Faust.js GitHub](https://github.com/wpengine/faustjs)
- [WooCommerce Support](https://woocommerce.com/support/)
- [WPGraphQL Community](https://github.com/wp-graphql/wp-graphql)

## 🚀 Deployment

### Production Checklist
- [ ] Update environment variables
- [ ] Configure production WordPress URL
- [ ] Set up SSL certificates
- [ ] Configure CDN for images
- [ ] Set up monitoring and analytics
- [ ] Test all functionality
- [ ] Optimize performance

### Build Commands
```bash
npm run build    # Build for production
npm run start    # Start production server
npm run export   # Export static site (if needed)
```

## 🎉 Success!

Once everything is set up, you'll have:
- ✅ A fully functional headless WooCommerce store
- ✅ Modern React frontend with Faust.js
- ✅ Optimized performance and user experience
- ✅ Scalable architecture for growth
- ✅ Developer-friendly codebase

Happy coding! 🎯✨
