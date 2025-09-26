#!/bin/bash

echo "🚀 Starting iOS Build Process..."

# Set environment variables for non-interactive build
export EAS_NO_VCS=1
export EXPO_NO_CAPABILITY_SYNC=1

# Clear any cached credentials
echo "Clearing EAS cache..."
eas build:cancel --all --non-interactive || true

# Check credentials status
echo "Checking credentials status..."
eas credentials:list --platform ios

# Start the build
echo "Starting iOS build..."
eas build --platform ios --profile production --non-interactive --clear-cache

echo "✅ Build started successfully!"
echo "You can monitor the build progress at: https://expo.dev/accounts/zestbet/projects/zestapp/builds"