#!/bin/bash

echo "🚀 Starting ZestBet Backend Server..."
echo "📍 Port: 3001"
echo "🔗 API: http://localhost:3001/api"
echo "🔗 tRPC: http://localhost:3001/api/trpc"
echo ""

# Kill any existing process on port 3001
echo "🧹 Cleaning up existing processes on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

# Start the development server
echo "🚀 Starting development server..."
bun run dev-server.ts

echo "✅ Backend server should now be running!"