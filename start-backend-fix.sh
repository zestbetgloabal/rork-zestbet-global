#!/bin/bash

echo "🔧 ZestBet Backend Fix - Starting Server..."
echo "⏰ $(date)"
echo ""

# Kill any existing process on port 3001
echo "🧹 Cleaning up port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Start the fixed backend server
echo "🚀 Starting fixed backend server..."
echo "📍 Server will be available at: http://localhost:3001"
echo "🔗 API Status: http://localhost:3001/api/status"
echo "🔗 tRPC Endpoint: http://localhost:3001/api/trpc"
echo ""

bun run backend-fix.ts