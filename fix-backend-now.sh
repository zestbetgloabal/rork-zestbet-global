#!/bin/bash

echo "🔧 ZestBet Backend Fix Script"
echo "============================="

# Kill any existing processes on port 3001
echo "🧹 Cleaning up existing processes on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install bun first:"
    echo "curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun is installed"

# Test if we can start the simple dev server
echo "🚀 Starting simple development server..."
echo "📍 Server will be available at: http://localhost:3001"
echo "🔗 API Status: http://localhost:3001/api/status"
echo "🔗 tRPC Endpoint: http://localhost:3001/api/trpc"
echo ""

# Start the server in background
bun run dev-server.ts &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 3

# Test the connection
echo "🧪 Testing server connection..."
if curl -s http://localhost:3001/api/status > /dev/null; then
    echo "✅ Server is running and responding!"
    echo "🔗 Testing API endpoint..."
    curl -s http://localhost:3001/api/status | head -5
    echo ""
    echo "🔗 Testing tRPC endpoint..."
    curl -s -X POST -H "Content-Type: application/json" -d '{"path":"example.hi","input":{"name":"test"}}' http://localhost:3001/api/trpc | head -5
    echo ""
    echo ""
    echo "✅ Backend is working! You can now use the app."
    echo "🎯 Keep this terminal open to keep the server running."
    echo "📱 Start your Expo app in another terminal with: bun start"
    echo ""
    echo "Press Ctrl+C to stop the server"
    
    # Keep the server running
    wait $SERVER_PID
else
    echo "❌ Server failed to start or is not responding"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi