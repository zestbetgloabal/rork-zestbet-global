#!/bin/bash

# Quick iOS build script for ZestBet Global
echo "🚀 Starting iOS build for ZestBet Global..."

# Install/update EAS CLI
npm install -g @expo/eas-cli

# Login if needed
eas whoami || eas login

# Configure credentials interactively
echo "Configuring iOS credentials..."
eas credentials:configure --platform ios --profile production

# Start build
echo "Starting build..."
eas build --platform ios --profile production --auto-submit

echo "✅ Build process initiated!"
echo "Check progress at: https://expo.dev/accounts/zestbet/projects/zestapp/builds"