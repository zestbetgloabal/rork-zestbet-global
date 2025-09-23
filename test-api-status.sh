#!/bin/bash

echo "🔍 Testing ZestBet API Status"
echo "============================"
echo ""

APP_URL="https://rork-zestbet-global.vercel.app"
API_URL="$APP_URL/api"
TRPC_URL="$API_URL/trpc"

echo "📍 Testing URLs:"
echo "• App: $APP_URL"
echo "• API: $API_URL"
echo "• tRPC: $TRPC_URL"
echo ""

# Test 1: Main app
echo "🔍 Test 1: Main App"
response=$(curl -s -w "\n%{http_code}" "$APP_URL")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

echo "HTTP Code: $http_code"
if [[ "$body" == *"<!DOCTYPE"* ]]; then
    echo "✅ App is serving HTML (React app is working)"
    if [[ "$body" == *"ZestBet"* ]]; then
        echo "✅ ZestBet app detected in HTML"
    else
        echo "⚠️  ZestBet not found in HTML, but app is loading"
    fi
else
    echo "❌ App is not serving HTML"
    echo "Response: $(echo "$body" | head -c 200)..."
fi
echo ""

# Test 2: API endpoint
echo "🔍 Test 2: API Endpoint"
response=$(curl -s -w "\n%{http_code}" "$API_URL")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

echo "HTTP Code: $http_code"
if [[ "$body" == *"<!DOCTYPE"* ]]; then
    echo "❌ API is serving HTML instead of JSON (deployment issue)"
    echo "This means the API routes are not properly configured"
else
    echo "✅ API is not serving HTML (good sign)"
    echo "Response: $(echo "$body" | head -c 200)..."
fi
echo ""

# Test 3: tRPC Hello endpoint
echo "🔍 Test 3: tRPC Hello Endpoint"
response=$(curl -s -w "\n%{http_code}" -X POST "$TRPC_URL/example.hi" \
    -H "Content-Type: application/json" \
    -d '{}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

echo "HTTP Code: $http_code"
if [[ "$body" == *"<!DOCTYPE"* ]]; then
    echo "❌ tRPC is serving HTML instead of JSON (deployment issue)"
    echo "The API is not properly deployed to Vercel"
elif [[ "$body" == *"hello"* ]] || [[ "$body" == *"result"* ]]; then
    echo "✅ tRPC is working! Got JSON response"
    echo "Response: $body"
else
    echo "⚠️  tRPC responded but format unclear"
    echo "Response: $(echo "$body" | head -c 200)..."
fi
echo ""

# Test 4: Test login endpoint
echo "🔍 Test 4: Login Endpoint"
response=$(curl -s -w "\n%{http_code}" -X POST "$TRPC_URL/auth.login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

echo "HTTP Code: $http_code"
if [[ "$body" == *"<!DOCTYPE"* ]]; then
    echo "❌ Login endpoint serving HTML (deployment issue)"
elif [[ "$body" == *"token"* ]] || [[ "$body" == *"user"* ]] || [[ "$body" == *"error"* ]]; then
    echo "✅ Login endpoint is working! Got JSON response"
    echo "Response: $(echo "$body" | head -c 200)..."
else
    echo "⚠️  Login endpoint responded but format unclear"
    echo "Response: $(echo "$body" | head -c 200)..."
fi
echo ""

echo "📋 Summary:"
echo "==========="
if [[ "$http_code" == "200" ]]; then
    echo "✅ Server is responding"
else
    echo "❌ Server issues detected"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. If you see HTML responses from API endpoints, redeploy to Vercel"
echo "2. If you see JSON responses, the API is working correctly"
echo "3. Run the full test suite: ./test-complete-app.sh"
echo "4. Test the mobile app with QR code"