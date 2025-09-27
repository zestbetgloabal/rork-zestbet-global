#!/bin/bash

echo "🚀 Starting ZestBet Backend Test"
echo "================================"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Check if backend files exist
if [ ! -f "backend/hono.ts" ]; then
    echo "❌ Backend files not found"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start the backend server
echo "🔧 Starting backend server..."
cd backend
PORT=3001 tsx server.ts &
BACKEND_PID=$!

# Wait for server to start
sleep 3

# Test the API endpoints
echo "🧪 Testing API endpoints..."

# Test health endpoint
echo "Testing /api endpoint..."
curl -s http://localhost:3001/api | jq . || echo "❌ API endpoint failed"

# Test status endpoint
echo "Testing /api/status endpoint..."
curl -s http://localhost:3001/api/status | jq . || echo "❌ Status endpoint failed"

# Test tRPC endpoint
echo "Testing /api/trpc endpoint..."
curl -s http://localhost:3001/api/trpc | jq . || echo "❌ tRPC endpoint failed"

# Clean up
kill $BACKEND_PID 2>/dev/null

echo "✅ Backend test completed"