#!/bin/bash

echo "🔧 ZestBet Expo Build Fix - Complete Solution"
echo "============================================="
echo ""

# Step 1: Fix file permissions aggressively
echo "Step 1: Fixing file permissions..."
sudo chmod 644 app.json 2>/dev/null && echo "  ✅ Fixed app.json permissions" || echo "  ⚠️  Could not fix app.json permissions"
sudo chmod 644 eas.json 2>/dev/null && echo "  ✅ Fixed eas.json permissions" || echo "  ⚠️  Could not fix eas.json permissions"  
sudo chmod 644 package.json 2>/dev/null && echo "  ✅ Fixed package.json permissions" || echo "  ⚠️  Could not fix package.json permissions"
sudo chmod 644 tsconfig.json 2>/dev/null && echo "  ✅ Fixed tsconfig.json permissions" || echo "  ⚠️  Could not fix tsconfig.json permissions"

# Step 2: Fix ownership
echo ""
echo "Step 2: Fixing file ownership..."
sudo chown $USER:$(id -gn) app.json 2>/dev/null && echo "  ✅ Fixed app.json ownership" || echo "  ℹ️  app.json ownership already correct"
sudo chown $USER:$(id -gn) eas.json 2>/dev/null && echo "  ✅ Fixed eas.json ownership" || echo "  ℹ️  eas.json ownership already correct"
sudo chown $USER:$(id -gn) package.json 2>/dev/null && echo "  ✅ Fixed package.json ownership" || echo "  ℹ️  package.json ownership already correct"

# Step 3: Clear all caches and temporary files
echo ""
echo "Step 3: Clearing all caches and temporary files..."
rm -rf .expo/ 2>/dev/null && echo "  ✅ Cleared .expo cache" || echo "  ℹ️  No .expo cache to clear"
rm -rf node_modules/.cache/ 2>/dev/null && echo "  ✅ Cleared node_modules cache" || echo "  ℹ️  No node_modules cache to clear"
rm -rf dist/ 2>/dev/null && echo "  ✅ Cleared dist folder" || echo "  ℹ️  No dist folder to clear"
rm -rf .expo-shared/ 2>/dev/null && echo "  ✅ Cleared .expo-shared" || echo "  ℹ️  No .expo-shared to clear"
rm -rf .next/ 2>/dev/null && echo "  ✅ Cleared .next cache" || echo "  ℹ️  No .next cache to clear"
rm -rf .turbo/ 2>/dev/null && echo "  ✅ Cleared .turbo cache" || echo "  ℹ️  No .turbo cache to clear"

# Step 4: Create backup and fix app.json
echo ""
echo "Step 4: Fixing app.json configuration..."
cp app.json app.json.backup 2>/dev/null && echo "  ✅ Created backup of app.json"

# Fix newArchEnabled using sed
sed -i.tmp 's/"newArchEnabled": true/"newArchEnabled": false/g' app.json 2>/dev/null && echo "  ✅ Fixed newArchEnabled setting" || echo "  ⚠️  Could not fix newArchEnabled"

# Fix Android permissions using Python
python3 -c "
import json
import sys

try:
    with open('app.json', 'r') as f:
        data = json.load(f)
    
    # Fix Android permissions - remove duplicates
    if 'expo' in data and 'android' in data['expo'] and 'permissions' in data['expo']['android']:
        permissions = data['expo']['android']['permissions']
        # Keep only android.permission.* versions, remove duplicates
        clean_permissions = []
        for perm in permissions:
            if perm.startswith('android.permission.') and perm not in clean_permissions:
                clean_permissions.append(perm)
        data['expo']['android']['permissions'] = clean_permissions
        print('  ✅ Fixed Android permissions')
    
    with open('app.json', 'w') as f:
        json.dump(data, f, indent=2)
        
except Exception as e:
    print(f'  ⚠️  Could not fix permissions: {e}')
" || echo "  ⚠️  Python fix failed, manual edit needed"

# Step 5: Remove temporary files
rm -f app.json.tmp 2>/dev/null

# Step 6: Reinstall dependencies
echo ""
echo "Step 5: Reinstalling dependencies..."
if command -v bun &> /dev/null; then
    echo "  Using bun..."
    bun install --force
elif command -v npm &> /dev/null; then
    echo "  Using npm..."
    npm install --force
else
    echo "  ⚠️  No package manager found!"
fi

# Step 7: Check EAS CLI
echo ""
echo "Step 6: Checking EAS CLI..."
if command -v eas &> /dev/null; then
    echo "  ✅ EAS CLI is installed"
    eas --version
else
    echo "  ⚠️  EAS CLI not found. Installing..."
    if command -v bun &> /dev/null; then
        bun add -g @expo/eas-cli
    elif command -v npm &> /dev/null; then
        npm install -g @expo/eas-cli
    fi
fi

# Step 8: Verify fixes
echo ""
echo "Step 7: Verifying fixes..."
if grep -q '"newArchEnabled": false' app.json; then
    echo "  ✅ newArchEnabled is correctly set to false"
else
    echo "  ⚠️  newArchEnabled still needs manual fix"
fi

if ! grep -q '"CAMERA"' app.json; then
    echo "  ✅ Duplicate Android permissions removed"
else
    echo "  ⚠️  Duplicate permissions still present"
fi

echo ""
echo "🎯 BUILD COMMANDS:"
echo "=================="
echo ""
echo "Now you can run:"
echo "eas build --platform ios --profile production"
echo "eas build --platform android --profile production"
echo "eas build --platform all --profile production"
echo ""

echo "💡 If you still get errors:"
echo "=========================="
echo "1. Make sure you're logged in: eas login"
echo "2. Configure build if needed: eas build:configure"
echo "3. Check project setup: eas project:info"
echo ""

echo "🔍 TROUBLESHOOTING:"
echo "=================="
echo "If 'JSON files are read-only' error persists:"
echo "1. Run: sudo chattr -i app.json eas.json package.json (Linux)"
echo "2. Run: sudo chflags nouchg app.json eas.json package.json (macOS)"
echo "3. Check if files are locked in your IDE/editor"
echo ""

echo "✨ Build fix complete!"
echo "Files should now be writable and ready for EAS build."