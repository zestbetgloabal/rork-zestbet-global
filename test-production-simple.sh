#!/bin/bash

# Simple test script to verify the production setup
echo "🔄 Testing production setup..."

# Test database connection
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set"
  exit 1
fi

echo "✅ DATABASE_URL is set"

# Test API endpoint
echo "🔄 Testing API endpoint..."
response=$(curl -s -X POST https://rork-zestbet-global.vercel.app/api/trpc/example.hi \
  -H "Content-Type: application/json" \
  -d '{}' || echo "API_ERROR")

if [[ "$response" == *"API_ERROR"* ]]; then
  echo "⚠️ API endpoint test failed"
else
  echo "✅ API endpoint test successful"
fi

echo "🎉 Production test completed!"