#!/bin/bash

echo "🧪 Testing WordPress OAuth Integration..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local url=$1
    local name=$2
    local expected_status=$3
    
    echo -e "\n${YELLOW}Testing: $name${NC}"
    echo "URL: $url"
    
    response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$url")
    status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ Status: $status_code (Expected: $expected_status)${NC}"
        if [ -f /tmp/response.json ]; then
            echo "Response:"
            cat /tmp/response.json | jq . 2>/dev/null || cat /tmp/response.json
        fi
    else
        echo -e "${RED}❌ Status: $status_code (Expected: $expected_status)${NC}"
        if [ -f /tmp/response.json ]; then
            echo "Response:"
            cat /tmp/response.json | jq . 2>/dev/null || cat /tmp/response.json
        fi
    fi
}

# Test WordPress backend
echo -e "\n${YELLOW}🔍 Testing WordPress Backend...${NC}"
test_endpoint "https://woo.local/wp-json/eternitty/v1/google-oauth" "WordPress OAuth Config" "200"
test_endpoint "https://woo.local/wp-json/eternitty/v1/google-oauth/url" "WordPress OAuth URL" "200"

# Test frontend (assuming port 3003)
echo -e "\n${YELLOW}🔍 Testing Frontend...${NC}"
test_endpoint "http://localhost:3003/api/google-oauth/config" "Frontend OAuth Config" "200"
test_endpoint "http://localhost:3003/api/google-oauth/url" "Frontend OAuth URL" "200"

# Test OAuth URL validity
echo -e "\n${YELLOW}🔍 Testing OAuth URL Validity...${NC}"
oauth_response=$(curl -s "http://localhost:3003/api/google-oauth/url")
if [ $? -eq 0 ]; then
    auth_url=$(echo "$oauth_response" | jq -r '.auth_url' 2>/dev/null)
    if [ "$auth_url" != "null" ] && [ "$auth_url" != "" ]; then
        echo -e "${GREEN}✅ OAuth URL generated: $auth_url${NC}"
        
        # Test if URL is accessible
        url_status=$(curl -s -o /dev/null -w "%{http_code}" "$auth_url")
        if [ "$url_status" = "200" ] || [ "$url_status" = "302" ]; then
            echo -e "${GREEN}✅ OAuth URL is accessible (Status: $url_status)${NC}"
        else
            echo -e "${RED}❌ OAuth URL not accessible (Status: $url_status)${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to extract OAuth URL from response${NC}"
    fi
else
    echo -e "${RED}❌ Failed to get OAuth URL from frontend${NC}"
fi

# Test environment variables
echo -e "\n${YELLOW}🔍 Testing Environment Variables...${NC}"
if [ -n "$NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID" ]; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID is set${NC}"
else
    echo -e "${RED}❌ NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID is not set${NC}"
fi

if [ -n "$GOOGLE_OAUTH_CLIENT_SECRET" ]; then
    echo -e "${GREEN}✅ GOOGLE_OAUTH_CLIENT_SECRET is set${NC}"
else
    echo -e "${RED}❌ GOOGLE_OAUTH_CLIENT_SECRET is not set${NC}"
fi

if [ -n "$NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI" ]; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI is set${NC}"
else
    echo -e "${RED}❌ NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI is not set${NC}"
fi

echo -e "\n${YELLOW}🎯 Test Summary:${NC}"
echo "1. WordPress backend endpoints"
echo "2. Frontend API endpoints"
echo "3. OAuth URL generation"
echo "4. Environment variables"
echo -e "\n${GREEN}✅ Testing completed!${NC}"
