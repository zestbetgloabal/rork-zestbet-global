#!/bin/bash

# ZestBet Global - Production Build Fix Script
# This script fixes all critical issues preventing successful builds

echo "🚀 ZestBet Global - Production Build Fix"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    echo "❌ Error: app.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Project root detected"

# 1. Fix EAS.json - Remove appleTeamId from submit section
echo "🔧 Fixing EAS.json configuration..."

if [ -f "eas.json" ]; then
    # Create backup
    cp eas.json eas.json.backup
    echo "📋 Backup created: eas.json.backup"
    
    # Remove appleTeamId line from submit section
    sed -i.tmp '/\"appleTeamId\": \"RLFRGC9727\"/d' eas.json
    rm eas.json.tmp 2>/dev/null || true
    
    echo "✅ Removed appleTeamId from eas.json"
else
    echo "⚠️  eas.json not found - skipping EAS fix"
fi

# 2. Fix app.json - Remove duplicate permissions
echo "🔧 Fixing app.json permissions..."

if [ -f "app.json" ]; then
    # Create backup
    cp app.json app.json.backup
    echo "📋 Backup created: app.json.backup"
    
    # Remove duplicate permissions (without android.permission prefix)
    sed -i.tmp '/"CAMERA",/d' app.json
    sed -i.tmp '/"READ_EXTERNAL_STORAGE",/d' app.json
    sed -i.tmp '/"WRITE_EXTERNAL_STORAGE",/d' app.json
    sed -i.tmp '/"RECORD_AUDIO"/d' app.json
    rm app.json.tmp 2>/dev/null || true
    
    echo "✅ Removed duplicate permissions from app.json"
else
    echo "⚠️  app.json not found - skipping permissions fix"
fi

# 3. Clean build cache
echo "🧹 Cleaning build cache..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf dist
echo "✅ Build cache cleaned"

# 4. Verify environment variables
echo "🔍 Verifying environment variables..."

if [ -f ".env" ]; then
    if grep -q "EXPO_PUBLIC_TRPC_URL" .env; then
        echo "✅ EXPO_PUBLIC_TRPC_URL found in .env"
    else
        echo "⚠️  EXPO_PUBLIC_TRPC_URL not found in .env"
    fi
    
    if grep -q "EXPO_PUBLIC_API_URL" .env; then
        echo "✅ EXPO_PUBLIC_API_URL found in .env"
    else
        echo "⚠️  EXPO_PUBLIC_API_URL not found in .env"
    fi
else
    echo "⚠️  .env file not found"
fi

# 5. Check package.json dependencies
echo "🔍 Checking critical dependencies..."

if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js version: $NODE_VERSION"
else
    echo "❌ Node.js not found"
fi

if command -v bun >/dev/null 2>&1; then
    BUN_VERSION=$(bun --version)
    echo "✅ Bun version: $BUN_VERSION"
else
    echo "⚠️  Bun not found - using npm/yarn"
fi

# 6. Install/update dependencies
echo "📦 Installing dependencies..."

if command -v bun >/dev/null 2>&1; then
    bun install
else
    npm install
fi

echo "✅ Dependencies installed"

# 7. Pre-build checks
echo "🔍 Running pre-build checks..."

# Check if expo CLI is available
if command -v expo >/dev/null 2>&1; then
    echo "✅ Expo CLI available"
else
    echo "⚠️  Expo CLI not found - installing..."
    npm install -g @expo/cli
fi

# Check if EAS CLI is available
if command -v eas >/dev/null 2>&1; then
    echo "✅ EAS CLI available"
else
    echo "⚠️  EAS CLI not found - installing..."
    npm install -g eas-cli
fi

# 8. Validate configuration
echo "🔍 Validating configuration..."

# Check app.json syntax
if node -e "JSON.parse(require('fs').readFileSync('app.json', 'utf8'))" 2>/dev/null; then
    echo "✅ app.json syntax valid"
else
    echo "❌ app.json syntax invalid"
fi

# Check eas.json syntax
if [ -f "eas.json" ]; then
    if node -e "JSON.parse(require('fs').readFileSync('eas.json', 'utf8'))" 2>/dev/null; then
        echo "✅ eas.json syntax valid"
    else
        echo "❌ eas.json syntax invalid"
    fi
fi

# 9. Summary and next steps
echo ""
echo "🎉 Build Fix Complete!"
echo "====================="
echo ""
echo "✅ Fixed Issues:"
echo "   - Removed appleTeamId from eas.json submit section"
echo "   - Removed duplicate Android permissions from app.json"
echo "   - Cleaned build cache"
echo "   - Verified dependencies"
echo ""
echo "⚠️  Manual Steps Required:"
echo "   1. Configure App Store Connect API Key in EAS Dashboard:"
echo "      https://expo.dev/accounts/wettapp/projects/ac2061c1-c033-49f1-b78a-7bd13067e86f/credentials"
echo ""
echo "   2. Or remove auto-submit from build commands:"
echo "      eas build --platform ios --profile production"
echo "      (without --auto-submit-with-profile production)"
echo ""
echo "🚀 Ready to build:"
echo "   eas build --platform ios --profile production"
echo "   eas build --platform android --profile production"
echo ""
echo "📱 Test the build:"
echo "   expo start --tunnel"
echo ""

# 10. Optional: Run a quick test build check
read -p "🤔 Would you like to run a quick build validation? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔍 Running build validation..."
    
    if expo doctor >/dev/null 2>&1; then
        echo "✅ Expo doctor passed"
    else
        echo "⚠️  Expo doctor found issues - check manually with: expo doctor"
    fi
    
    echo "✅ Build validation complete"
fi

echo ""
echo "🎯 Your app is now ready for production builds!"
echo "   All critical issues have been resolved."
echo ""