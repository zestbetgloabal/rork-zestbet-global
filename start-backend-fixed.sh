#!/bin/bash

echo "🚀 ZestBet Backend Startup Script"
echo "================================="

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install bun first:"
    echo "curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one from .env.example"
    exit 1
fi

echo "✅ Environment file found"
echo "✅ Bun is installed"

# Kill any existing process on port 3001
echo "🔧 Checking for existing processes on port 3001..."
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3001 is in use. Attempting to kill existing process..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "🔧 Starting backend server..."
echo "📍 Server URL: http://localhost:3001"
echo "🔗 API Status: http://localhost:3001/api/status"
echo "🔗 tRPC Endpoint: http://localhost:3001/api/trpc"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the backend server (simplified version first)
echo "🔧 Starting simplified backend server..."
exec bun run backend/server-simple.ts