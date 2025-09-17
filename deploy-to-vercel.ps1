# Vercel Deployment Script for Eternitty Headless WooCommerce
# This script helps deploy your Next.js application to Vercel

Write-Host "🚀 Starting Vercel Deployment Process..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local not found. You'll need to set environment variables in Vercel dashboard." -ForegroundColor Yellow
    Write-Host "   Please refer to VERCEL_DEPLOYMENT_GUIDE.md for required environment variables." -ForegroundColor Yellow
}

# Install Vercel CLI if not already installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI is already installed" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Blue
    npm install -g vercel
}

# Build the project locally first
Write-Host "🔨 Building project locally..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix the errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod

Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Set up environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "2. Configure your custom domain (optional)" -ForegroundColor White
Write-Host "3. Test your deployed application" -ForegroundColor White
Write-Host "4. Set up monitoring and analytics" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see VERCEL_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
