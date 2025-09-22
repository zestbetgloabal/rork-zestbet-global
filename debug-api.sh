#!/bin/bash
set -e

# 🔍 ZestBet API Debug Script
# Diagnoses the "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" error

echo "🔍 ZestBet API Debug - Finding the JSON parsing issue..."
echo ""

# Test URLs
VERCEL_URL="https://rork-zestbet-global.vercel.app"
API_URL="$VERCEL_URL/api"
TRPC_URL="$API_URL/trpc"

echo "📍 Testing URLs:"
echo "App: $VERCEL_URL"
echo "API: $API_URL"
echo "tRPC: $TRPC_URL"
echo ""

# Function to test endpoint with detailed output
test_endpoint_debug() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    
    echo "🔍 Testing $name..."
    echo "URL: $url"
    echo "Method: $method"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        echo "Data: $data"
        echo "Full curl command:"
        echo "curl -v -X POST '$url' -H 'Content-Type: application/json' -d '$data'"
        echo ""
        echo "Response:"
        response=$(curl -v -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        echo "Full curl command:"
        echo "curl -v '$url'"
        echo ""
        echo "Response:"
        response=$(curl -v "$url" 2>&1)
    fi
    
    echo "$response"
    echo ""
    echo "Response analysis:"
    if echo "$response" | grep -q "<!DOCTYPE"; then
        echo "❌ ERROR: Receiving HTML instead of JSON"
        echo "This means the endpoint is returning a web page, not API data"
    elif echo "$response" | grep -q "HTTP/.*200"; then
        echo "✅ HTTP 200 OK"
    elif echo "$response" | grep -q "HTTP/.*404"; then
        echo "❌ HTTP 404 - Endpoint not found"
    elif echo "$response" | grep -q "HTTP/.*500"; then
        echo "❌ HTTP 500 - Server error"
    fi
    echo ""
    echo "="*50
    echo ""
}

# Test 1: Basic API health check
test_endpoint_debug "API Health Check" "$API_URL"

# Test 2: tRPC Hello endpoint
test_endpoint_debug "tRPC Hello" "$TRPC_URL/example.hi" "POST" '{}'

# Test 3: Check if API route exists
test_endpoint_debug "API Status" "$API_URL/status"

# Test 4: Check what's at the root
test_endpoint_debug "App Root" "$VERCEL_URL"

echo "🔧 Diagnosis Summary:"
echo "If you see HTML responses (<!DOCTYPE), it means:"
echo "1. The API routes are not properly configured"
echo "2. Vercel is serving the frontend instead of API"
echo "3. The backend/hono.ts is not being deployed correctly"
echo ""
echo "💡 Solutions:"
echo "1. Check if backend/hono.ts is in the correct location"
echo "2. Verify Vercel deployment includes API routes"
echo "3. Update .env to use correct URLs"
echo "4. Check Vercel function logs"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
echo "📊 Check your deployment logs there"