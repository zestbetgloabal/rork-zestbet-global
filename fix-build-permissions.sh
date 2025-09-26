#!/bin/bash

echo "🔧 Fixing build permissions and configuration..."

# Make all JSON files writable
chmod 644 app.json
chmod 644 eas.json
chmod 644 package.json
chmod 644 tsconfig.json

# Make sure all directories are accessible
chmod 755 .
chmod -R 755 app/
chmod -R 755 components/
chmod -R 755 constants/
chmod -R 755 lib/
chmod -R 755 store/
chmod -R 755 types/
chmod -R 755 utils/
chmod -R 755 assets/

# Clear any potential cache issues
rm -rf .expo/
rm -rf node_modules/.cache/
rm -rf dist/

echo "✅ Permissions fixed!"
echo ""
echo "🚀 Now you can run:"
echo "  eas build --platform ios --profile production"
echo "  eas build --platform android --profile production"