#!/bin/bash

echo "🚀 ZestBet Build Preparation Script"
echo "=================================="
echo ""

# Make script executable
chmod +x "$0"

echo "✅ Step 1: Routing structure fixed"
echo "   - Removed duplicate index.tsx files"
echo "   - Created app/(auth)/start.tsx as main welcome screen"
echo ""

echo "⚠️  Step 2: MANUAL CONFIGURATION REQUIRED"
echo "========================================="
echo ""
echo "You need to manually edit these files:"
echo ""

echo "📝 1. Edit app.json:"
echo "   Change: \"newArchEnabled\": true"
echo "   To:     \"newArchEnabled\": false"
echo ""
echo "   Remove duplicate Android permissions (keep only android.permission.* versions):"
echo "   Remove these lines from permissions array:"
echo "   - \"CAMERA\","
echo "   - \"READ_EXTERNAL_STORAGE\","
echo "   - \"WRITE_EXTERNAL_STORAGE\","
echo "   - \"RECORD_AUDIO\""
echo ""

echo "📝 2. Fix file permissions:"
echo "   Run: chmod 644 app.json eas.json package.json tsconfig.json"
echo ""

echo "🧹 Step 3: Cleaning caches..."
rm -rf .expo/ 2>/dev/null && echo "   ✅ Cleared .expo cache" || echo "   ℹ️  No .expo cache to clear"
rm -rf node_modules/.cache/ 2>/dev/null && echo "   ✅ Cleared node_modules cache" || echo "   ℹ️  No node_modules cache to clear"
rm -rf dist/ 2>/dev/null && echo "   ✅ Cleared dist folder" || echo "   ℹ️  No dist folder to clear"

echo ""
echo "🔧 Step 4: Reinstalling dependencies..."
if command -v bun &> /dev/null; then
    echo "   Using bun..."
    bun install
elif command -v npm &> /dev/null; then
    echo "   Using npm..."
    npm install
else
    echo "   ⚠️  No package manager found!"
fi

echo ""
echo "🎯 AFTER MANUAL EDITS, RUN THESE COMMANDS:"
echo "=========================================="
echo ""
echo "For iOS build:"
echo "eas build --platform ios --profile production"
echo ""
echo "For Android build:"
echo "eas build --platform android --profile production"
echo ""
echo "For both platforms:"
echo "eas build --platform all --profile production"
echo ""

echo "💡 TROUBLESHOOTING:"
echo "==================="
echo ""
echo "If you still get 'JSON files are read-only' errors:"
echo "1. Run: sudo chmod 644 app.json eas.json package.json"
echo "2. Check file ownership: ls -la app.json"
echo "3. If needed: sudo chown \$USER:staff app.json eas.json package.json"
echo ""
echo "If build fails with newArch errors:"
echo "1. Ensure newArchEnabled is set to false in app.json"
echo "2. Clear all caches: rm -rf .expo node_modules/.cache dist"
echo "3. Reinstall: bun install (or npm install)"
echo ""

echo "✨ Build preparation complete!"
echo "Please make the manual edits above, then run your EAS build command."