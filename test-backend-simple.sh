#!/bin/bash

echo "🧪 Testing Backend Connection"
echo "=============================="

# Test if backend is running
echo "📡 Testing backend server..."
curl -s http://localhost:3001/api/status || {
    echo "❌ Backend server is not running on port 3001"
    echo "💡 Start it with: ./start-backend.sh or bun run dev-server.ts"
    exit 1
}

echo "✅ Backend server is running!"

# Test tRPC endpoint
echo "📡 Testing tRPC endpoint..."
curl -s -X POST http://localhost:3001/api/trpc \
  -H "Content-Type: application/json" \
  -d '{"path":"example.hi","input":{"name":"test"}}' || {
    echo "❌ tRPC endpoint is not responding"
    exit 1
}

echo "✅ tRPC endpoint is working!"

# Test challenges endpoint
echo "📡 Testing challenges endpoint..."
curl -s -X POST http://localhost:3001/api/trpc \
  -H "Content-Type: application/json" \
  -d '{"path":"challenges.list","input":{}}' || {
    echo "❌ Challenges endpoint is not responding"
    exit 1
}

echo "✅ All backend tests passed!"
echo "🚀 Backend is ready for development"