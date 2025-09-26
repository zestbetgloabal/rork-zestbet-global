#!/bin/bash

echo "🧪 Testing AWS Lambda API deployment..."

# Get the API endpoint from serverless info
API_ENDPOINT=$(serverless info --stage prod | grep -o 'https://[^[:space:]]*execute-api[^[:space:]]*')

if [ -z "$API_ENDPOINT" ]; then
    echo "❌ Could not find API endpoint. Make sure deployment was successful."
    exit 1
fi

echo "🔍 Found API endpoint: $API_ENDPOINT"

# Test health check
echo "🏥 Testing health check..."
curl -s "$API_ENDPOINT/" | jq '.'

# Test status endpoint
echo "📊 Testing status endpoint..."
curl -s "$API_ENDPOINT/status" | jq '.'

# Test tRPC endpoint
echo "🔌 Testing tRPC endpoint..."
curl -s -X POST "$API_ENDPOINT/trpc/example.hi" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'

echo "✅ API testing complete!"
echo ""
echo "📋 Your AWS Lambda API endpoints:"
echo "- Base URL: $API_ENDPOINT"
echo "- Health Check: $API_ENDPOINT/"
echo "- Status: $API_ENDPOINT/status"
echo "- tRPC: $API_ENDPOINT/trpc"
echo ""
echo "🔧 Next steps:"
echo "1. Update your .env file:"
echo "   EXPO_PUBLIC_API_URL=$API_ENDPOINT"
echo "   EXPO_PUBLIC_TRPC_URL=$API_ENDPOINT/trpc"
echo ""
echo "2. Update eas.json production environment with the new URLs"
echo "3. Rebuild your app with: eas build --platform all"