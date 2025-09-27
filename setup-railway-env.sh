#!/bin/bash

echo "🔧 Setting up environment variables for Railway deployment..."

# Create or update .env file
cat > .env << EOF
# Railway Production URLs
EXPO_PUBLIC_API_URL=https://rork-zestbet-global-production.up.railway.app/api
EXPO_PUBLIC_TRPC_URL=https://rork-zestbet-global-production.up.railway.app/api/trpc
EXPO_PUBLIC_BASE_URL=https://rork-zestbet-global-production.up.railway.app

# Development URLs (for local testing)
# EXPO_PUBLIC_API_URL=http://localhost:3001/api
# EXPO_PUBLIC_TRPC_URL=http://localhost:3001/api/trpc
# EXPO_PUBLIC_BASE_URL=http://localhost:3001

# Backend Environment
NODE_ENV=production
PORT=8080
HOST=0.0.0.0

# Database (configure in Railway dashboard)
# DATABASE_URL=your_database_url_here

# CORS Origins
CORS_ORIGIN=http://localhost:19006,http://localhost:19000,http://localhost:8081,http://localhost:3000
EOF

echo "✅ Environment variables configured in .env file"
echo ""
echo "📋 Current configuration:"
echo "  API URL: https://rork-zestbet-global-production.up.railway.app/api"
echo "  tRPC URL: https://rork-zestbet-global-production.up.railway.app/api/trpc"
echo "  Base URL: https://rork-zestbet-global-production.up.railway.app"
echo ""
echo "🚀 To test the connection, run:"
echo "  node test-railway-connection.js"
echo ""
echo "📱 To start the app with these settings:"
echo "  npm start"