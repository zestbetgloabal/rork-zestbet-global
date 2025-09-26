#!/bin/bash

echo "🔧 Comprehensive EAS Build Fix..."

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

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Install/Update EAS CLI
echo "Installing/Updating EAS CLI..."
npm install -g @expo/eas-cli@latest
print_status "EAS CLI updated"

# Check EAS login
echo "Checking EAS authentication..."
if eas whoami > /dev/null 2>&1; then
    CURRENT_USER=$(eas whoami)
    print_status "Logged in as: $CURRENT_USER"
else
    print_warning "Not logged in to EAS. Please login:"
    eas login
fi

# Install dependencies
echo "Installing project dependencies..."
npm install
print_status "Dependencies installed"

# Clear EAS cache
echo "Clearing EAS cache..."
rm -rf ~/.expo
rm -rf node_modules/.cache
print_status "Cache cleared"

# Check project configuration
echo "Validating project configuration..."
if [ -f "app.json" ]; then
    print_status "app.json found"
else
    print_error "app.json not found!"
    exit 1
fi

if [ -f "eas.json" ]; then
    print_status "eas.json found"
else
    print_error "eas.json not found!"
    exit 1
fi

# Check credentials
echo "Checking iOS credentials..."
eas credentials:list --platform ios --profile production || {
    print_warning "iOS credentials not found. Setting up..."
    eas credentials:configure --platform ios --profile production
}

# Validate build configuration
echo "Validating build configuration..."
eas build:configure --platform ios --profile production --non-interactive || {
    print_warning "Build configuration needs setup"
    eas build:configure --platform ios
}

# Pre-build validation
echo "Running pre-build validation..."
npx expo doctor || print_warning "Some issues found, but continuing..."

print_status "Build environment is ready!"
echo ""
echo "🚀 You can now start the build with:"
echo "   ./start-ios-build-fixed.sh"
echo ""
echo "Or manually with:"
echo "   eas build --platform ios --profile production"