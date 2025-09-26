#!/bin/bash

# Make scripts executable
chmod +x start-dev.sh
chmod +x start-backend.js

echo "✅ Scripts are now executable"
echo ""
echo "🚀 Quick Start Guide:"
echo "1. Run './start-dev.sh' to start the backend server"
echo "2. In another terminal, run 'expo start' to start the app"
echo "3. Open the app in Expo Go or web browser"
echo ""
echo "🔧 Alternative:"
echo "- Run 'node start-backend.js' to start only the backend"
echo "- Run 'bun run backend/hono.ts' for direct backend start"