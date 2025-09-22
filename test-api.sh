#!/bin/bash

echo "🧪 Testing ZestBet Production API..."
echo "=================================="

API_BASE="https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default"

echo ""
echo "1. Testing API Health Check..."
curl -s "$API_BASE/" | jq '.' || echo "❌ Health check failed"

echo ""
echo "2. Testing API Status..."
curl -s "$API_BASE/status" | jq '.' || echo "❌ Status check failed"

echo ""
echo "3. Testing tRPC Hello Endpoint..."
curl -s -X POST "$API_BASE/trpc/example.hi" \
  -H "Content-Type: application/json" \
  -d '{"json":{}}' | jq '.' || echo "❌ tRPC test failed"

echo ""
echo "4. Testing CORS Headers..."
curl -s -I -X OPTIONS "$API_BASE/trpc/example.hi" \
  -H "Origin: https://zestapp.online" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" | grep -i "access-control" || echo "❌ CORS test failed"

echo ""
echo "✅ API Tests completed!"
echo ""
echo "Next steps:"
echo "1. Set Lambda environment variables in AWS Console"
echo "2. Run database migration: cd backend/database && node migrate.js"
echo "3. Test your app at: https://zestapp.online"
echo ""