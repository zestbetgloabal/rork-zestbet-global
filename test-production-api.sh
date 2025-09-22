#!/bin/bash

# 🧪 ZestBet API Test Script
# Testet alle wichtigen Endpunkte der Produktions-API

API_URL="https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/api"

echo "🚀 Testing ZestBet Production API..."
echo "API URL: $API_URL"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
curl -s "$API_URL/" | jq '.' || echo "❌ Health check failed"
echo ""

# Test 2: Status Check
echo "2️⃣ Testing Status Endpoint..."
curl -s "$API_URL/status" | jq '.' || echo "❌ Status check failed"
echo ""

# Test 3: tRPC Hello Endpoint
echo "3️⃣ Testing tRPC Hello..."
curl -s -X POST "$API_URL/trpc/example.hi" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.' || echo "❌ tRPC hello failed"
echo ""

# Test 4: User Registration (Test Email)
echo "4️⃣ Testing User Registration..."
TEST_EMAIL="test-$(date +%s)@example.com"
curl -s -X POST "$API_URL/trpc/auth.register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"test123456\",\"name\":\"Test User\"}" | jq '.' || echo "❌ Registration failed"
echo ""

# Test 5: CORS Check
echo "5️⃣ Testing CORS Headers..."
curl -s -I -X OPTIONS "$API_URL/trpc/example.hi" \
  -H "Origin: https://zestapp.online" \
  -H "Access-Control-Request-Method: POST" | grep -i "access-control" || echo "❌ CORS check failed"
echo ""

echo "✅ API Tests completed!"
echo ""
echo "📧 Email Test:"
echo "If registration worked, check your Strato email logs for verification emails."
echo ""
echo "🔗 API Gateway URL: $API_URL"
echo "🔗 tRPC Endpoint: $API_URL/trpc"
echo "🔗 Health Check: $API_URL/"