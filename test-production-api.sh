#!/bin/bash

# 🧪 ZestBet API Test Script
# Testet alle wichtigen Endpunkte der Produktions-API

API_URL="https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/api"
TRPC_URL="https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/api/trpc"

echo "🚀 Testing ZestBet Production API..."
echo "API URL: $API_URL"
echo "tRPC URL: $TRPC_URL"
echo ""

# Function to test with better error handling
test_endpoint() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    local headers="$5"
    
    echo "🔍 Testing $name..."
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            $headers \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" "$url" $headers)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo "✅ $name: HTTP $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo "❌ $name: HTTP $http_code"
        echo "$body"
    fi
    echo ""
}

# Test 1: Health Check
test_endpoint "Health Check" "$API_URL/"

# Test 2: tRPC Hello Endpoint
test_endpoint "tRPC Hello" "$TRPC_URL/example.hi" "POST" '{}'

# Test 3: User Registration (Test Email)
TEST_EMAIL="test-$(date +%s)@example.com"
test_endpoint "User Registration" "$TRPC_URL/auth.register" "POST" "{\"email\":\"$TEST_EMAIL\",\"password\":\"test123456\",\"name\":\"Test User\"}"

# Test 4: Login Test
test_endpoint "User Login" "$TRPC_URL/auth.login" "POST" '{"email":"test@example.com","password":"password123"}'

# Test 5: CORS Check
echo "🔍 Testing CORS Headers..."
cors_response=$(curl -s -I -X OPTIONS "$TRPC_URL/example.hi" \
  -H "Origin: https://zestapp.online" \
  -H "Access-Control-Request-Method: POST")

if echo "$cors_response" | grep -i "access-control-allow-origin" > /dev/null; then
    echo "✅ CORS: Headers present"
    echo "$cors_response" | grep -i "access-control"
else
    echo "❌ CORS: No CORS headers found"
fi
echo ""

# Test 6: Database Connection (via API)
test_endpoint "Database Connection" "$TRPC_URL/user.profile" "POST" '{}'

echo "🎯 Test Summary:"
echo "✅ API Tests completed!"
echo ""
echo "📧 Email Test:"
echo "If registration worked, check your Strato email logs for verification emails."
echo ""
echo "🔗 API Gateway URL: $API_URL"
echo "🔗 tRPC Endpoint: $TRPC_URL"
echo "🔗 Health Check: $API_URL/"
echo ""
echo "📱 Next Steps:"
echo "1. Check email delivery in Strato"
echo "2. Test mobile app with production API"
echo "3. Monitor Lambda logs in AWS CloudWatch"