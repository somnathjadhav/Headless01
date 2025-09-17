#!/bin/bash

echo "🧪 Testing OAuth Fix After Google Console Update..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test OAuth URL
test_oauth_url() {
    local port=$1
    local name=$2
    
    echo -e "\n${YELLOW}Testing OAuth on port $port ($name)${NC}"
    
    # Get OAuth URL
    oauth_response=$(curl -s "http://localhost:$port/api/google-oauth/url")
    
    if [ $? -eq 0 ]; then
        auth_url=$(echo "$oauth_response" | jq -r '.auth_url' 2>/dev/null)
        
        if [ "$auth_url" != "null" ] && [ "$auth_url" != "" ]; then
            echo -e "${GREEN}✅ OAuth URL generated successfully${NC}"
            echo "URL: $auth_url"
            
            # Test if URL redirects properly (should not show policy error)
            echo "Testing OAuth URL validity..."
            response=$(curl -s -I "$auth_url")
            
            if echo "$response" | grep -q "302"; then
                if echo "$response" | grep -q "oauth/error"; then
                    echo -e "${RED}❌ Still getting OAuth policy error${NC}"
                    echo "Response: $response"
                else
                    echo -e "${GREEN}✅ OAuth URL is working correctly!${NC}"
                fi
            else
                echo -e "${RED}❌ OAuth URL not redirecting properly${NC}"
            fi
        else
            echo -e "${RED}❌ Failed to extract OAuth URL${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to get OAuth URL from frontend${NC}"
    fi
}

# Test on different ports
test_oauth_url "3000" "Primary"
test_oauth_url "3001" "Secondary"
test_oauth_url "3002" "Tertiary"

echo -e "\n${YELLOW}🎯 Test Summary:${NC}"
echo "1. OAuth URL generation"
echo "2. OAuth URL validity"
echo "3. Google policy compliance"
echo -e "\n${GREEN}✅ Testing completed!${NC}"
