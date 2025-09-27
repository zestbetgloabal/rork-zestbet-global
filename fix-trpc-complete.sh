#!/bin/bash

echo "🚀 ZestBet tRPC Connection Fix - Complete Solution"
echo "=================================================="

echo ""
echo "📋 Problem Analysis:"
echo "- Environment variables EXPO_PUBLIC_TRPC_URL and EXPO_PUBLIC_API_URL are undefined"
echo "- tRPC client receiving HTML instead of JSON (server not running or misconfigured)"
echo "- Backend server may have dependency issues preventing startup"
echo ""

echo "🔧 Solution Steps:"
echo "1. Run backend diagnostic"
echo "2. Fix environment variables"
echo "3. Start simplified backend server"
echo "4. Test connection"
echo "5. Provide next steps"
echo ""

# Step 1: Diagnostic
echo "📋 Step 1: Running backend diagnostic..."
echo "========================================"
bun run backend-diagnostic.ts

echo ""
echo "🔧 Step 2: Environment Variable Fix"
echo "===================================="

# Ensure environment variables are set
export EXPO_PUBLIC_TRPC_URL="http://localhost:3001/api/trpc"
export EXPO_PUBLIC_API_URL="http://localhost:3001/api"
export PORT=3001
export NODE_ENV=development

echo "✅ Environment variables set:"
echo "   EXPO_PUBLIC_TRPC_URL: $EXPO_PUBLIC_TRPC_URL"
echo "   EXPO_PUBLIC_API_URL: $EXPO_PUBLIC_API_URL"
echo "   PORT: $PORT"
echo "   NODE_ENV: $NODE_ENV"

# Step 3: Clean up existing processes
echo ""
echo "🧹 Step 3: Cleaning up existing processes"
echo "========================================="

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Killing existing process on port 3001..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
    echo "✅ Port 3001 cleaned up"
else
    echo "✅ Port 3001 is available"
fi

# Step 4: Start backend in background for testing
echo ""
echo "🚀 Step 4: Starting backend server for testing"
echo "=============================================="

echo "Starting simplified backend server in background..."
bun run backend/server-simple.ts &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Waiting 5 seconds for server to start..."
sleep 5

# Step 5: Test connection
echo ""
echo "🧪 Step 5: Testing connection"
echo "============================="

bun run test-backend-connection-simple.ts
TEST_RESULT=$?

# Step 6: Stop test server
echo ""
echo "🛑 Step 6: Stopping test server"
echo "==============================="

kill $BACKEND_PID 2>/dev/null || true
sleep 2

# Step 7: Results and next steps
echo ""
echo "📊 Results and Next Steps"
echo "========================="

if [ $TEST_RESULT -eq 0 ]; then
    echo "🎉 SUCCESS! Backend connection is working correctly."
    echo ""
    echo "✅ Next steps:"
    echo "1. Start the backend server: ./start-backend-fixed.sh"
    echo "2. In another terminal, start your Expo app: bun start"
    echo "3. The tRPC connection should now work properly"
    echo ""
    echo "🔧 To start the backend server now:"
    echo "./start-backend-fixed.sh"
else
    echo "❌ FAILED! There are still issues with the backend connection."
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "1. Check if all dependencies are installed: bun install"
    echo "2. Verify .env file exists and has correct values"
    echo "3. Check for any TypeScript compilation errors"
    echo "4. Try running the diagnostic again: bun run backend-diagnostic.ts"
    echo ""
    echo "📞 If issues persist, please share the error messages above."
fi

echo ""
echo "🏁 Fix script completed!"