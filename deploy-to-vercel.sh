#!/bin/bash

# Vercel Deployment Script for Eternitty Headless WooCommerce
# This script helps deploy your Next.js application to Vercel

echo "🚀 Starting Vercel Deployment Process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. You'll need to set environment variables in Vercel dashboard."
    echo "   Please refer to VERCEL_DEPLOYMENT_GUIDE.md for required environment variables."
fi

# Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project locally first
echo "🔨 Building project locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Configure your custom domain (optional)"
echo "3. Test your deployed application"
echo "4. Set up monitoring and analytics"
echo ""
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT_GUIDE.md"
