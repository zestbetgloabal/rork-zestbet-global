#!/bin/bash

echo "🔧 ZestBet Build Fix - Automated Solution"
echo "========================================"
echo ""

# Step 1: Fix file permissions
echo "Step 1: Fixing file permissions..."
sudo chmod 644 app.json 2>/dev/null && echo "  ✅ Fixed app.json permissions" || echo "  ⚠️  Could not fix app.json permissions"
sudo chmod 644 eas.json 2>/dev/null && echo "  ✅ Fixed eas.json permissions" || echo "  ⚠️  Could not fix eas.json permissions"
sudo chmod 644 package.json 2>/dev/null && echo "  ✅ Fixed package.json permissions" || echo "  ⚠️  Could not fix package.json permissions"
sudo chmod 644 tsconfig.json 2>/dev/null && echo "  ✅ Fixed tsconfig.json permissions" || echo "  ⚠️  Could not fix tsconfig.json permissions"

# Step 2: Fix ownership if needed
echo ""
echo "Step 2: Fixing file ownership..."
sudo chown $USER:staff app.json 2>/dev/null && echo "  ✅ Fixed app.json ownership" || echo "  ℹ️  app.json ownership already correct"
sudo chown $USER:staff eas.json 2>/dev/null && echo "  ✅ Fixed eas.json ownership" || echo "  ℹ️  eas.json ownership already correct"
sudo chown $USER:staff package.json 2>/dev/null && echo "  ✅ Fixed package.json ownership" || echo "  ℹ️  package.json ownership already correct"

# Step 3: Clear all caches
echo ""
echo "Step 3: Clearing all caches..."
rm -rf .expo/ 2>/dev/null && echo "  ✅ Cleared .expo cache" || echo "  ℹ️  No .expo cache to clear"
rm -rf node_modules/.cache/ 2>/dev/null && echo "  ✅ Cleared node_modules cache" || echo "  ℹ️  No node_modules cache to clear"
rm -rf dist/ 2>/dev/null && echo "  ✅ Cleared dist folder" || echo "  ℹ️  No dist folder to clear"
rm -rf .expo-shared/ 2>/dev/null && echo "  ✅ Cleared .expo-shared" || echo "  ℹ️  No .expo-shared to clear"

# Step 4: Create backup and fix app.json
echo ""
echo "Step 4: Fixing app.json configuration..."
cp app.json app.json.backup 2>/dev/null && echo "  ✅ Created backup of app.json"

# Fix newArchEnabled
sed -i.tmp 's/"newArchEnabled": true/"newArchEnabled": false/g' app.json 2>/dev/null && echo "  ✅ Fixed newArchEnabled setting" || echo "  ⚠️  Could not fix newArchEnabled"

# Remove duplicate Android permissions
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

# Step 5: Reinstall dependencies
echo ""
echo "Step 5: Reinstalling dependencies..."
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
echo "1. Check if EAS CLI is installed: npm install -g @expo/eas-cli"
echo "2. Login to EAS: eas login"
echo "3. Check project setup: eas build:configure"
echo ""

echo "✨ Build fix complete!"