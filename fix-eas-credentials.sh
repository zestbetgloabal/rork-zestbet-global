#!/bin/bash

echo "🔧 Fixing EAS Build Credentials..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    npm install -g @expo/eas-cli
fi

# Login to EAS (if not already logged in)
echo "Checking EAS login status..."
eas whoami || {
    echo "Please login to EAS:"
    eas login
}

# Configure credentials for iOS
echo "Configuring iOS credentials..."
eas credentials:configure --platform ios --profile production

# Configure credentials for Android
echo "Configuring Android credentials..."
eas credentials:configure --platform android --profile production

# Show current credentials status
echo "Current credentials status:"
eas credentials:list

echo "✅ Credentials setup complete!"
echo ""
echo "Now you can run the build with:"
echo "eas build --platform ios --profile production"
echo "or"
echo "eas build --platform android --profile production"