#!/bin/bash

echo "🚀 Starting ZestBet Backend Development Server"
echo "=============================================="

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install bun first:"
    echo "curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Kill any existing process on port 3001
echo "🔧 Checking for existing processes on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Start backend server
echo "🔧 Starting backend server on port 3001..."
echo "📍 Server will be available at: http://localhost:3001"
echo "🔗 API Status: http://localhost:3001/api/status"
echo "🔗 tRPC Endpoint: http://localhost:3001/api/trpc"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the real backend server with tRPC
# Try bun first, fallback to npx tsx
if command -v bun &> /dev/null; then
    bun run backend/server.ts
else
    echo "⚠️  Bun not found, using npx tsx instead..."
    npx tsx backend/server.ts
fi