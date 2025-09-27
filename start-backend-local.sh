#!/bin/bash

echo "🚀 Starting ZestBet Backend Server..."
echo "📍 Port: 3001"
echo "🌐 Environment: development"

# Load environment variables
export NODE_ENV=development
export PORT=3001
export HOST=0.0.0.0

# Start the backend server
npx tsx backend/server.ts