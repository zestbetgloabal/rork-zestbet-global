#!/bin/bash

echo "🔧 ZestBet Build Fix Script"
echo "=========================="
echo ""

# Step 1: Fix permissions
echo "Step 1: Fixing file permissions..."
chmod 644 app.json 2>/dev/null || echo "  ⚠️  Could not change app.json permissions (may need sudo)"
chmod 644 eas.json 2>/dev/null || echo "  ⚠️  Could not change eas.json permissions (may need sudo)"
chmod 644 package.json 2>/dev/null || echo "  ⚠️  Could not change package.json permissions (may need sudo)"
chmod 644 tsconfig.json 2>/dev/null || echo "  ⚠️  Could not change tsconfig.json permissions (may need sudo)"

# Step 2: Clear caches
echo ""
echo "Step 2: Clearing caches..."
rm -rf .expo/ 2>/dev/null && echo "  ✅ Cleared .expo cache" || echo "  ℹ️  No .expo cache to clear"
rm -rf node_modules/.cache/ 2>/dev/null && echo "  ✅ Cleared node_modules cache" || echo "  ℹ️  No node_modules cache to clear"
rm -rf dist/ 2>/dev/null && echo "  ✅ Cleared dist folder" || echo "  ℹ️  No dist folder to clear"

# Step 3: Check current configuration
echo ""
echo "Step 3: Checking current configuration..."
if grep -q '"newArchEnabled": true' app.json; then
    echo "  ⚠️  WARNING: newArchEnabled is set to true - this can cause build issues!"
    echo "     You need to manually change it to false in app.json"
fi

if grep -q '"CAMERA"' app.json; then
    echo "  ⚠️  WARNING: Duplicate Android permissions found"
    echo "     You should remove the duplicate CAMERA, READ_EXTERNAL_STORAGE, etc. entries"
fi

# Step 4: Reinstall dependencies
echo ""
echo "Step 4: Reinstalling dependencies..."
if command -v bun &> /dev/null; then
    echo "  Using bun..."
    bun install
elif command -v npm &> /dev/null; then
    echo "  Using npm..."
    npm install
else
    echo "  ⚠️  No package manager found!"
fi

echo ""
echo "🎯 MANUAL FIXES NEEDED:"
echo "======================"
echo ""
echo "1. Edit app.json and change:"
echo "   \"newArchEnabled\": true  →  \"newArchEnabled\": false"
echo ""
echo "2. In app.json, remove duplicate Android permissions:"
echo "   Remove these lines from the permissions array:"
echo "   \"CAMERA\","
echo "   \"READ_EXTERNAL_STORAGE\","
echo "   \"WRITE_EXTERNAL_STORAGE\","
echo "   \"RECORD_AUDIO\""
echo "   (Keep only the android.permission.* versions)"
echo ""
echo "3. Fix routing issue - you have two index files:"
echo "   - app/(auth)/index.tsx"
echo "   - app/(tabs)/index.tsx"
echo "   Consider renaming one of them or restructuring your routes."
echo ""
echo "🚀 AFTER MANUAL FIXES, RUN:"
echo "=========================="
echo "eas build --platform ios --profile production"
echo "eas build --platform android --profile production"
echo ""
echo "💡 If you still get permission errors, try:"
echo "sudo chmod 644 app.json eas.json package.json"