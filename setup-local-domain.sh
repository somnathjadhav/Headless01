#!/bin/bash

echo "🌐 Setting up local domain for Google OAuth..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will help you set up a local domain for Google OAuth.${NC}"
echo -e "${YELLOW}Google OAuth doesn't allow 'localhost' domains, so we'll use a local domain instead.${NC}"

echo -e "\n${BLUE}Step 1: Add local domain to /etc/hosts${NC}"
echo "We'll add 'headless.local' to your hosts file."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${GREEN}Running as root, can modify /etc/hosts directly${NC}"
    
    # Add the domain to hosts file
    if ! grep -q "headless.local" /etc/hosts; then
        echo "127.0.0.1 headless.local" >> /etc/hosts
        echo -e "${GREEN}✅ Added headless.local to /etc/hosts${NC}"
    else
        echo -e "${YELLOW}⚠️ headless.local already exists in /etc/hosts${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Not running as root. You'll need to manually add this line to /etc/hosts:${NC}"
    echo -e "${BLUE}127.0.0.1 headless.local${NC}"
    echo ""
    echo "To do this manually:"
    echo "1. Open Terminal"
    echo "2. Run: sudo nano /etc/hosts"
    echo "3. Add: 127.0.0.1 headless.local"
    echo "4. Save and exit"
fi

echo -e "\n${BLUE}Step 2: Update Google Cloud Console${NC}"
echo "Now update your Google Cloud Console with these settings:"
echo ""
echo -e "${YELLOW}Authorized JavaScript origins:${NC}"
echo "http://headless.local:3000"
echo "http://headless.local:3001"
echo "http://headless.local:3002"
echo "http://headless.local:3003"
echo "https://woo.local"
echo ""
echo -e "${YELLOW}Authorized redirect URIs:${NC}"
echo "https://woo.local/wp-json/eternitty/v1/auth/google/callback"
echo ""
echo -e "${YELLOW}Authorized domains (OAuth consent screen):${NC}"
echo "headless.local"
echo "woo.local"

echo -e "\n${BLUE}Step 3: Update your development server${NC}"
echo "After updating Google Console, you can access your app at:"
echo -e "${GREEN}http://headless.local:3000${NC}"
echo -e "${GREEN}http://headless.local:3001${NC}"
echo -e "${GREEN}http://headless.local:3002${NC}"
echo -e "${GREEN}http://headless.local:3003${NC}"

echo -e "\n${BLUE}Step 4: Test the setup${NC}"
echo "Run this command to test:"
echo -e "${GREEN}curl -s http://headless.local:3000/api/google-oauth/config${NC}"

echo -e "\n${GREEN}✅ Setup instructions completed!${NC}"
echo -e "${YELLOW}Remember to update Google Cloud Console with the new domain settings.${NC}"
