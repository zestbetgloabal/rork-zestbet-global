#!/bin/bash

echo "🔧 Making backend fix scripts executable..."

chmod +x fix-trpc-complete.sh
chmod +x fix-backend-connection.sh  
chmod +x start-backend-fixed.sh
chmod +x test-backend-connection.ts
chmod +x backend-diagnostic.ts

# Also make build scripts executable
chmod +x fix-eas-credentials.sh 2>/dev/null || true
chmod +x start-ios-build-fixed.sh 2>/dev/null || true
chmod +x fix-build-environment.sh 2>/dev/null || true

echo "✅ All scripts are now executable"

echo ""
echo "🚀 Quick Start Guide - tRPC Connection Fix"
echo "==========================================="
echo ""
echo "To fix your tRPC connection issue, run:"
echo "./fix-trpc-complete.sh"
echo ""
echo "This will:"
echo "1. Diagnose the current issues"
echo "2. Fix environment variables"
echo "3. Test the backend connection"
echo "4. Provide next steps"
echo ""
echo "After the fix script completes successfully, start the backend with:"
echo "./start-backend-fixed.sh"