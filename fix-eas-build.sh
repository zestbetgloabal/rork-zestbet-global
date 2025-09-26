#!/bin/bash

echo "🚀 Fixing EAS Build Credentials..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    npm install -g @expo/eas-cli
fi

# Login to EAS (if not already logged in)
echo "Checking EAS authentication..."
eas whoami || eas login

# Configure credentials for iOS
echo "Configuring iOS credentials..."
eas credentials:configure --platform ios --profile production

# Configure credentials for Android
echo "Configuring Android credentials..."
eas credentials:configure --platform android --profile production

# Build iOS
echo "Starting iOS build..."
eas build --platform ios --profile production --auto-submit

echo "✅ Build process started!"
echo "Check your build status at: https://expo.dev/accounts/zestbet/projects/zestapp/builds"