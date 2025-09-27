#!/bin/bash

echo "🚀 Starting ZestBet Real Backend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
fi

# Run database migration
echo "🗄️ Running database migration..."
tsx backend/database/migrate.js

# Start the backend server
echo "🔥 Starting backend server..."
tsx start-backend-real.ts