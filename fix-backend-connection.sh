#!/bin/bash

echo "🔧 ZestBet Backend Connection Fix"
echo "================================="

# Step 1: Run diagnostic
echo "📋 Step 1: Running diagnostic..."
bun run backend-diagnostic.ts

echo ""
echo "🔧 Step 2: Fixing environment variables..."

# Check if environment variables are properly loaded
if [ -z "$EXPO_PUBLIC_TRPC_URL" ]; then
    echo "⚠️  EXPO_PUBLIC_TRPC_URL not set, using default"
    export EXPO_PUBLIC_TRPC_URL="http://localhost:3001/api/trpc"
fi

if [ -z "$EXPO_PUBLIC_API_URL" ]; then
    echo "⚠️  EXPO_PUBLIC_API_URL not set, using default"
    export EXPO_PUBLIC_API_URL="http://localhost:3001/api"
fi

echo "✅ Environment variables configured"
echo "   EXPO_PUBLIC_TRPC_URL: $EXPO_PUBLIC_TRPC_URL"
echo "   EXPO_PUBLIC_API_URL: $EXPO_PUBLIC_API_URL"

echo ""
echo "🔧 Step 3: Stopping any existing backend processes..."

# Kill any existing processes on port 3001
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Killing existing process on port 3001..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 3
fi

echo ""
echo "🔧 Step 4: Testing backend connection..."

# Test if we can start the simplified backend
echo "🚀 Starting simplified backend server..."
echo "📍 Server URL: http://localhost:3001"
echo "🔗 API Status: http://localhost:3001/api/status"
echo "🔗 tRPC Endpoint: http://localhost:3001/api/trpc"
echo ""
echo "The server will start in 3 seconds..."
echo "Press Ctrl+C to stop the server"
echo ""

sleep 3

# Start the simplified backend
bun run backend/server-simple.ts