# Setup Guide

## Prerequisites

- Node.js 18+ 
- npm 8+
- WordPress backend with WooCommerce
- Redis (optional, for caching)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp env.local.example .env.local
   ```

4. Configure your `.env.local` file with:
   - WordPress API URL
   - WooCommerce API credentials
   - Other required settings

5. Start development server:
   ```bash
   npm run dev
   ```

## Environment Variables

See `env.local.example` for all available environment variables.

## WordPress Backend Setup

Ensure your WordPress backend has:
- WooCommerce plugin installed and configured
- REST API enabled
- CORS configured for your frontend domain
- Proper API permissions set up
