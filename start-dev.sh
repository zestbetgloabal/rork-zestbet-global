#!/bin/bash

echo "🚀 Starting ZestBet Development Environment"
echo "=========================================="

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install bun first:"
    echo "curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Start backend server in background
echo "🔧 Starting backend server on port 3001..."
bun run dev-server.ts &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:3001/api/status > /dev/null; then
    echo "✅ Backend server is running on http://localhost:3001"
    echo "🔗 API URL: http://localhost:3001/api"
    echo "🔗 tRPC URL: http://localhost:3001/api/trpc"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

echo ""
echo "✅ Development environment is ready!"
echo "📱 You can now run 'expo start' in another terminal"
echo "🌐 Or run 'expo start --web' for web development"
echo ""
echo "Press Ctrl+C to stop all servers"

# Keep script running
wait $BACKEND_PID