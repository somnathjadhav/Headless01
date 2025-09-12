#!/bin/bash

echo "🌐 Setting up lvh.me domain for Google OAuth..."
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}lvh.me is Google's approved local development domain.${NC}"
echo -e "${YELLOW}It automatically resolves to 127.0.0.1, so no hosts file changes needed!${NC}"

echo -e "\n${BLUE}Step 1: Test lvh.me domain${NC}"
echo "Testing if lvh.me resolves correctly..."

# Test if lvh.me resolves
if ping -c 1 headless.lvh.me > /dev/null 2>&1; then
    echo -e "${GREEN}✅ lvh.me domain is working${NC}"
else
    echo -e "${YELLOW}⚠️ lvh.me might not be available on your system${NC}"
    echo "This is normal - lvh.me should work in browsers even if ping fails"
fi

echo -e "\n${BLUE}Step 2: Update Google Cloud Console${NC}"
echo "Update your Google Cloud Console with these settings:"
echo ""
echo -e "${YELLOW}OAuth Consent Screen - App domain:${NC}"
echo "Application home page: http://headless.lvh.me:3000"
echo "Privacy policy URL: http://headless.lvh.me:3000/privacy.html"
echo "Terms of service URL: http://headless.lvh.me:3000/terms.html"
echo ""
echo -e "${YELLOW}Authorized domains:${NC}"
echo "headless.lvh.me"
echo ""
echo -e "${YELLOW}OAuth Credentials - Authorized JavaScript origins:${NC}"
echo "http://headless.lvh.me:3000"
echo "http://headless.lvh.me:3001"
echo "http://headless.lvh.me:3002"
echo "http://headless.lvh.me:3003"
echo ""
echo -e "${YELLOW}Authorized redirect URIs:${NC}"
echo "http://headless.lvh.me:3000/api/google-oauth/callback"

echo -e "\n${BLUE}Step 3: Update your WordPress backend${NC}"
echo "You'll need to update your WordPress OAuth settings to use:"
echo "Redirect URI: http://headless.lvh.me:3000/api/google-oauth/callback"

echo -e "\n${BLUE}Step 4: Test the setup${NC}"
echo "After updating Google Console, you can access your app at:"
echo -e "${GREEN}http://headless.lvh.me:3000${NC}"
echo -e "${GREEN}http://headless.lvh.me:3001${NC}"
echo -e "${GREEN}http://headless.lvh.me:3002${NC}"
echo -e "${GREEN}http://headless.lvh.me:3003${NC}"

echo -e "\n${BLUE}Step 5: Test OAuth${NC}"
echo "Run this command to test:"
echo -e "${GREEN}curl -s http://headless.lvh.me:3000/api/google-oauth/config${NC}"

echo -e "\n${GREEN}✅ Setup instructions completed!${NC}"
echo -e "${YELLOW}lvh.me is Google's approved domain for local development.${NC}"
echo -e "${YELLOW}No hosts file changes needed - it automatically resolves to 127.0.0.1!${NC}"
