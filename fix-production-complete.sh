#!/bin/bash

echo "🚀 ZestBet Global - Production Fix Script"
echo "========================================"

# Step 1: Clean up lock files
echo "📦 Cleaning up lock files..."
if [ -f "package-lock.json" ]; then
    rm package-lock.json
    echo "✅ Removed package-lock.json"
fi

# Step 2: Update dependencies
echo "🔄 Updating dependencies..."
npx expo install --check
npx expo install --fix

# Step 3: Check project health
echo "🏥 Running health check..."
npx expo doctor

# Step 4: Clear EAS cache
echo "🧹 Clearing EAS cache..."
npx eas build --platform ios --profile production --clear-cache --non-interactive || echo "⚠️  Build failed - manual ASC API key setup required"

echo ""
echo "🎯 MANUAL STEPS REQUIRED:"
echo "========================"
echo "1. Update app.json with the fixed version from PRODUCTION-FIX-COMPLETE.md"
echo "2. Set up App Store Connect API Key:"
echo "   npx eas credentials:configure --platform ios"
echo "3. Run build again:"
echo "   npx eas build --platform ios --profile production"
echo ""
echo "📋 See PRODUCTION-FIX-COMPLETE.md for detailed instructions"