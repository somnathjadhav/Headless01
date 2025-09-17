#!/bin/bash

echo "🔍 Finding Your Working Development Server..."
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test a port
test_port() {
    local port=$1
    local url="http://localhost:$port"
    local 127_url="http://127.0.0.1:$port"
    
    echo -e "\n${BLUE}Testing port $port...${NC}"
    
    # Test localhost
    localhost_status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$localhost_status" = "200" ]; then
        echo -e "${GREEN}✅ localhost:$port is working (Status: $localhost_status)${NC}"
        
        # Test OAuth config
        oauth_response=$(curl -s "$url/api/google-oauth/config")
        if [ $? -eq 0 ]; then
            oauth_enabled=$(echo "$oauth_response" | jq -r '.data.enabled' 2>/dev/null)
            if [ "$oauth_enabled" = "true" ]; then
                echo -e "${GREEN}✅ OAuth is enabled on localhost:$port${NC}"
                echo -e "${GREEN}🎯 Use this URL: $url${NC}"
                return 0
            else
                echo -e "${YELLOW}⚠️ OAuth is disabled on localhost:$port${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ localhost:$port not working (Status: $localhost_status)${NC}"
    fi
    
    # Test 127.0.0.1
    ip_status=$(curl -s -o /dev/null -w "%{http_code}" "$127_url")
    if [ "$ip_status" = "200" ]; then
        echo -e "${GREEN}✅ 127.0.0.1:$port is working (Status: $ip_status)${NC}"
        
        # Test OAuth config
        oauth_response=$(curl -s "$127_url/api/google-oauth/config")
        if [ $? -eq 0 ]; then
            oauth_enabled=$(echo "$oauth_response" | jq -r '.data.enabled' 2>/dev/null)
            if [ "$oauth_enabled" = "true" ]; then
                echo -e "${GREEN}✅ OAuth is enabled on 127.0.0.1:$port${NC}"
                echo -e "${GREEN}🎯 Use this URL: $127_url${NC}"
                return 0
            else
                echo -e "${YELLOW}⚠️ OAuth is disabled on 127.0.0.1:$port${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ 127.0.0.1:$port not working (Status: $ip_status)${NC}"
    fi
    
    return 1
}

# Test common ports
working_server=""
for port in 3000 3001 3002 3003; do
    if test_port $port; then
        working_server="found"
        break
    fi
done

if [ "$working_server" = "found" ]; then
    echo -e "\n${GREEN}🎉 Found a working server with OAuth enabled!${NC}"
    echo -e "\n${YELLOW}📋 Next Steps:${NC}"
    echo "1. Use the URL shown above to access your app"
    echo "2. Go to the signin page to test Google OAuth"
    echo "3. Update Google Cloud Console with the correct port"
else
    echo -e "\n${RED}❌ No working server with OAuth enabled found${NC}"
    echo -e "\n${YELLOW}🔧 Troubleshooting:${NC}"
    echo "1. Make sure your development server is running"
    echo "2. Check if OAuth is properly configured"
    echo "3. Try restarting your development server"
fi

echo -e "\n${BLUE}💡 Tip:${NC}"
echo "If you see multiple servers running, you might have multiple instances."
echo "Try stopping all servers and starting fresh with: npm run dev"
