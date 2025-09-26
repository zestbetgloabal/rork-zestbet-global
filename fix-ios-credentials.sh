#!/bin/bash

echo "🔧 Fixing iOS credentials and starting build..."

# Make sure we're using the latest EAS CLI
echo "📦 Installing latest EAS CLI..."
npm install -g @expo/eas-cli@latest

# Login to EAS (this should use the EXPO_TOKEN from environment)
echo "🔐 Checking EAS authentication..."
npx eas-cli whoami

# Clear any existing credentials cache
echo "🧹 Clearing credentials cache..."
npx eas-cli credentials:clear --platform ios --profile production --non-interactive || echo "No cache to clear"

# Try to setup credentials automatically
echo "🔑 Setting up iOS credentials..."
npx eas-cli credentials:configure --platform ios --profile production --non-interactive || echo "Auto-setup failed, will try manual approach"

# List current credentials
echo "📋 Current credentials status:"
npx eas-cli credentials:list --platform ios --profile production || echo "No credentials found"

# Start the build with credential creation
echo "🚀 Starting iOS build with credential creation..."
npx eas-cli build --platform ios --profile production --non-interactive --clear-cache

echo "✅ Build process completed!"