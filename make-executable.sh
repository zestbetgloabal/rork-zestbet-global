#!/bin/bash

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x setup.sh
chmod +x deploy-simple.sh
chmod +x test-api.sh 2>/dev/null || true

echo "✅ Scripts are now executable!"
echo ""
echo "🚀 You can now run:"
echo "  ./setup.sh          - Complete setup"
echo "  ./deploy-simple.sh   - Simple deployment"
echo "  node test-api.js     - Test API"
echo "  node backend/database/migrate.js - Run migrations"
echo "  node backend/database/reset.js   - Reset database"