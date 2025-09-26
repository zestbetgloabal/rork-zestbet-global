#!/bin/bash

echo "🔧 ZestBet Global - EAS Build Fix Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    print_error "app.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Found app.json - we're in the right directory"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    print_warning "EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
    if [ $? -eq 0 ]; then
        print_status "EAS CLI installed successfully"
    else
        print_error "Failed to install EAS CLI"
        exit 1
    fi
else
    print_status "EAS CLI is already installed"
fi

# Check EAS authentication
print_status "Checking EAS authentication..."
if eas whoami &> /dev/null; then
    CURRENT_USER=$(eas whoami)
    print_status "Already logged in as: $CURRENT_USER"
else
    print_warning "Not logged in to EAS. Please login:"
    eas login
    if [ $? -ne 0 ]; then
        print_error "Failed to login to EAS"
        exit 1
    fi
fi

# Initialize EAS project if needed
print_status "Initializing EAS project..."
eas init --id 4aa81beb-ebf2-4e52-85bd-a04abd142c5e --non-interactive --force
if [ $? -eq 0 ]; then
    print_status "EAS project initialized"
else
    print_warning "EAS init had issues, but continuing..."
fi

# Configure iOS credentials
print_status "Configuring iOS credentials..."
eas credentials:configure --platform ios --profile production
if [ $? -eq 0 ]; then
    print_status "iOS credentials configured"
else
    print_error "Failed to configure iOS credentials"
    exit 1
fi

# Start the build
print_status "Starting iOS production build..."
print_warning "This may take 10-20 minutes..."

eas build --platform ios --profile production --auto-submit --clear-cache

if [ $? -eq 0 ]; then
    print_status "Build started successfully!"
    echo ""
    echo "🎉 Your build is now in progress!"
    echo "📱 Check status at: https://expo.dev/accounts/zestbet/projects/zestapp/builds"
    echo "📧 You'll receive an email when the build is complete"
    echo ""
else
    print_error "Build failed to start"
    echo ""
    echo "🔍 Troubleshooting steps:"
    echo "1. Check your Apple Developer account status"
    echo "2. Verify your bundle identifier is correct"
    echo "3. Ensure your certificates are valid"
    echo "4. Try running: eas credentials:configure --platform ios --profile production"
    exit 1
fi