<<<<<<< HEAD
# Headless WordPress Frontend

A modern Next.js frontend for a headless WordPress CMS.

## Project Structure

```
headless-frontend/
├── public/                     # Static assets
├── src/                        # Source code
│   ├── pages/                  # Next.js routing
│   ├── components/             # UI components
│   ├── lib/                    # Utilities & API layer
│   ├── context/                # React Context
│   ├── hooks/                  # Custom React hooks
│   ├── styles/                 # CSS & styling
│   └── types/                  # TypeScript types
├── .env.local                  # Environment variables
├── next.config.js              # Next.js config
├── tailwind.config.js          # TailwindCSS config
└── package.json                # Dependencies
```

## Features

- **Next.js 14** with App Router support
- **TailwindCSS** for styling
- **GraphQL** integration with WordPress
- **TypeScript** support (optional)
- **SEO optimization** with meta tags
- **Authentication** ready
- **Caching** layer
- **Responsive design**

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp env.local.example .env.local
   ```

3. Update `.env.local` with your WordPress API URL

4. Run development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## WordPress Backend Setup

Ensure your WordPress backend has:
- GraphQL plugin enabled
- CORS configured for your frontend domain
- JWT authentication (if using auth features)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

- `WORDPRESS_API_URL` - WordPress GraphQL endpoint
- `NEXT_PUBLIC_SITE_URL` - Your frontend URL
- `JWT_SECRET` - JWT secret for authentication

## Contributing

1. Follow the existing code structure
2. Use TypeScript for new features
3. Follow React best practices
4. Test your changes thoroughly
# NextGen-Commerce
=======
# Documentation

This folder contains all the documentation for the Headless WooCommerce Frontend project.

## Structure

- `setup/` - Setup and installation guides
- `features/` - Feature-specific documentation
- `deployment/` - Deployment guides
- `security/` - Security-related documentation
- `performance/` - Performance optimization guides
- `troubleshooting/` - Common issues and solutions

## Quick Start

1. See `setup/README.md` for installation instructions
2. Check `features/README.md` for feature documentation
3. Review `deployment/README.md` for deployment guides

## Contributing

When adding new documentation:
- Use clear, descriptive filenames
- Include examples where helpful
- Keep documentation up-to-date with code changes
>>>>>>> auto-commit-20250923
