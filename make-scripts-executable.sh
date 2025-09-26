#!/bin/bash

echo "Making build scripts executable..."

chmod +x fix-eas-credentials.sh
chmod +x start-ios-build-fixed.sh  
chmod +x fix-build-environment.sh

echo "✅ All scripts are now executable!"
echo ""
echo "Run these scripts in order:"
echo "1. ./fix-build-environment.sh  - Sets up the build environment"
echo "2. ./fix-eas-credentials.sh    - Configures EAS credentials"
echo "3. ./start-ios-build-fixed.sh  - Starts the iOS build"