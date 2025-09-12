#!/bin/bash

echo "🧪 Testing reCAPTCHA Disabled Status..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test reCAPTCHA config endpoint
echo -e "\n${BLUE}1. Testing reCAPTCHA Config Endpoint${NC}"
recaptcha_response=$(curl -s "http://localhost:3000/api/recaptcha/config")
if [ $? -eq 0 ]; then
    enabled=$(echo "$recaptcha_response" | jq -r '.data.enabled' 2>/dev/null)
    if [ "$enabled" = "false" ]; then
        echo -e "${GREEN}✅ reCAPTCHA is disabled in config${NC}"
    else
        echo -e "${RED}❌ reCAPTCHA is still enabled${NC}"
    fi
    echo "Response: $recaptcha_response"
else
    echo -e "${RED}❌ Failed to fetch reCAPTCHA config${NC}"
fi

# Test signin page
echo -e "\n${BLUE}2. Testing Signin Page${NC}"
signin_response=$(curl -s "http://localhost:3000/signin")
if [ $? -eq 0 ]; then
    if echo "$signin_response" | grep -qi "captcha\|recaptcha"; then
        echo -e "${YELLOW}⚠️ reCAPTCHA references found in signin page${NC}"
    else
        echo -e "${GREEN}✅ No reCAPTCHA references in signin page${NC}"
    fi
else
    echo -e "${RED}❌ Failed to fetch signin page${NC}"
fi

# Test signup page
echo -e "\n${BLUE}3. Testing Signup Page${NC}"
signup_response=$(curl -s "http://localhost:3000/signup")
if [ $? -eq 0 ]; then
    if echo "$signup_response" | grep -qi "captcha\|recaptcha"; then
        echo -e "${YELLOW}⚠️ reCAPTCHA references found in signup page${NC}"
    else
        echo -e "${GREEN}✅ No reCAPTCHA references in signup page${NC}"
    fi
else
    echo -e "${RED}❌ Failed to fetch signup page${NC}"
fi

# Test API endpoints
echo -e "\n${BLUE}4. Testing API Endpoints${NC}"

# Test signin API (should work without reCAPTCHA)
echo "Testing signin API without reCAPTCHA..."
signin_api_response=$(curl -s -X POST "http://localhost:3000/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}')

if echo "$signin_api_response" | grep -q "reCAPTCHA not configured"; then
    echo -e "${RED}❌ Signin API still requires reCAPTCHA${NC}"
else
    echo -e "${GREEN}✅ Signin API works without reCAPTCHA${NC}"
fi

# Test signup API (should work without reCAPTCHA)
echo "Testing signup API without reCAPTCHA..."
signup_api_response=$(curl -s -X POST "http://localhost:3000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"testpassword"}')

if echo "$signup_api_response" | grep -q "reCAPTCHA not configured"; then
    echo -e "${RED}❌ Signup API still requires reCAPTCHA${NC}"
else
    echo -e "${GREEN}✅ Signup API works without reCAPTCHA${NC}"
fi

echo -e "\n${YELLOW}🎯 Summary:${NC}"
echo "1. reCAPTCHA config endpoint"
echo "2. Signin page"
echo "3. Signup page"
echo "4. API endpoints"
echo -e "\n${GREEN}✅ reCAPTCHA disabled testing completed!${NC}"

echo -e "\n${BLUE}💡 Note:${NC}"
echo "reCAPTCHA is now disabled. Users can sign in/sign up without completing reCAPTCHA verification."
echo "To re-enable reCAPTCHA later, change 'enabled: false' to 'enabled: true' in the config API."
