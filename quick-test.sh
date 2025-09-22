#!/bin/bash
set -e

echo "🧪 Quick ZestBet API Test"
echo "========================"
echo ""

# Configuration
APP_URL="https://rork-zestbet-global.vercel.app"
API_URL="$APP_URL/api"
TRPC_URL="$API_URL/trpc"

echo "📍 Testing URLs:"
echo "• App: $APP_URL"
echo "• API: $API_URL"
echo "• tRPC: $TRPC_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    
    echo "🔍 Testing $name..."
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ $name: HTTP $http_code - OK"
        if echo "$body" | jq . >/dev/null 2>&1; then
            echo "   JSON Response: $(echo "$body" | jq -c .)"
        else
            echo "   Response: $(echo "$body" | head -c 100)..."
        fi
    else
        echo "❌ $name: HTTP $http_code - ERROR"
        echo "   Response: $(echo "$body" | head -c 200)..."
    fi
    echo ""
}

# Run tests
test_endpoint "API Health Check" "$API_URL"
test_endpoint "tRPC Hello" "$TRPC_URL/example.hi" "POST" '{}'
test_endpoint "User Login Test" "$TRPC_URL/auth.login" "POST" '{"email":"test@example.com","password":"password123"}'

echo "🎯 Quick Test Complete!"
echo ""
echo "If you see JSON responses above, your API is working!"
echo "If you see HTML (<!DOCTYPE), you need to redeploy to Vercel."
echo ""
echo "📝 Next steps:"
echo "1. Commit and push these changes to trigger Vercel redeploy"
echo "2. Run the full test suite: ./test-complete-app.sh"
echo "3. Test the mobile app with QR code"