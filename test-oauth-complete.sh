#!/bin/bash

echo "🧪 Complete OAuth Policy Compliance Test"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test OAuth URL and check for policy errors
test_oauth_compliance() {
    local port=$1
    local name=$2
    
    echo -e "\n${BLUE}Testing OAuth Compliance on port $port ($name)${NC}"
    echo "================================================"
    
    # Get OAuth URL
    echo "1. Getting OAuth URL..."
    oauth_response=$(curl -s "http://localhost:$port/api/google-oauth/url")
    
    if [ $? -eq 0 ]; then
        auth_url=$(echo "$oauth_response" | jq -r '.auth_url' 2>/dev/null)
        
        if [ "$auth_url" != "null" ] && [ "$auth_url" != "" ]; then
            echo -e "${GREEN}✅ OAuth URL generated successfully${NC}"
            echo "URL: $auth_url"
            
            # Test OAuth URL for policy compliance
            echo -e "\n2. Testing OAuth policy compliance..."
            response=$(curl -s -I "$auth_url")
            
            if echo "$response" | grep -q "302"; then
                if echo "$response" | grep -q "oauth/error"; then
                    echo -e "${RED}❌ OAuth policy compliance error detected${NC}"
                    echo "Error details:"
                    echo "$response" | grep -i "location"
                    
                    # Extract error details
                    error_url=$(echo "$response" | grep -i "location" | cut -d' ' -f2)
                    if [ -n "$error_url" ]; then
                        echo "Error URL: $error_url"
                        
                        # Check for specific error types
                        if echo "$error_url" | grep -q "invalid_request"; then
                            echo -e "${RED}❌ Error: invalid_request - Missing required OAuth consent screen components${NC}"
                        elif echo "$error_url" | grep -q "access_denied"; then
                            echo -e "${RED}❌ Error: access_denied - OAuth consent screen not properly configured${NC}"
                        fi
                    fi
                else
                    echo -e "${GREEN}✅ OAuth URL is working correctly!${NC}"
                    echo -e "${GREEN}✅ No policy compliance errors detected${NC}"
                fi
            else
                echo -e "${RED}❌ OAuth URL not redirecting properly${NC}"
                echo "Response: $response"
            fi
        else
            echo -e "${RED}❌ Failed to extract OAuth URL${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to get OAuth URL from frontend${NC}"
    fi
}

# Test WordPress backend
echo -e "\n${YELLOW}🔍 Testing WordPress Backend...${NC}"
wordpress_response=$(curl -s "https://woo.local/wp-json/eternitty/v1/auth/google/login")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ WordPress backend is responding${NC}"
    wordpress_url=$(echo "$wordpress_response" | jq -r '.auth_url' 2>/dev/null)
    if [ "$wordpress_url" != "null" ]; then
        echo "WordPress OAuth URL: $wordpress_url"
    fi
else
    echo -e "${RED}❌ WordPress backend not responding${NC}"
fi

# Test frontend on different ports
test_oauth_compliance "3000" "Primary"
test_oauth_compliance "3001" "Secondary"
test_oauth_compliance "3002" "Tertiary"

# Test privacy policy and terms
echo -e "\n${YELLOW}🔍 Testing Required URLs...${NC}"
echo "Testing privacy policy..."
privacy_status=$(curl -s -o /dev/null -w "%{http_code}" "https://woo.local/privacy.html")
if [ "$privacy_status" = "200" ]; then
    echo -e "${GREEN}✅ Privacy policy is accessible${NC}"
else
    echo -e "${RED}❌ Privacy policy not accessible (Status: $privacy_status)${NC}"
fi

echo "Testing terms of service..."
terms_status=$(curl -s -o /dev/null -w "%{http_code}" "https://woo.local/terms.html")
if [ "$terms_status" = "200" ]; then
    echo -e "${GREEN}✅ Terms of service is accessible${NC}"
else
    echo -e "${RED}❌ Terms of service not accessible (Status: $terms_status)${NC}"
fi

echo -e "\n${YELLOW}🎯 Test Summary:${NC}"
echo "1. WordPress backend connectivity"
echo "2. Frontend OAuth URL generation"
echo "3. OAuth policy compliance"
echo "4. Required privacy policy and terms URLs"
echo -e "\n${GREEN}✅ Complete testing finished!${NC}"

echo -e "\n${BLUE}📋 Next Steps if errors persist:${NC}"
echo "1. Update OAuth consent screen with privacy policy and terms URLs"
echo "2. Ensure only required scopes are configured (openid, email, profile)"
echo "3. Verify redirect URIs match exactly"
echo "4. Wait 5-10 minutes for Google changes to propagate"
