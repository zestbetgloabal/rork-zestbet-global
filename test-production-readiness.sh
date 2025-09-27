#!/bin/bash

# ZestBet Global - Production Readiness Test Script
# This script tests all critical systems to ensure production readiness

echo "🧪 ZestBet Global - Production Readiness Test"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNING=0

# Helper functions
test_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

test_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

test_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((TESTS_WARNING++))
}

test_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. File Structure Tests
echo ""
echo "📁 Testing File Structure..."
echo "----------------------------"

if [ -f "app.json" ]; then
    test_pass "app.json exists"
else
    test_fail "app.json missing"
fi

if [ -f "eas.json" ]; then
    test_pass "eas.json exists"
else
    test_warn "eas.json missing (optional for some deployments)"
fi

if [ -f "package.json" ]; then
    test_pass "package.json exists"
else
    test_fail "package.json missing"
fi

if [ -f ".env" ]; then
    test_pass ".env exists"
else
    test_warn ".env missing (using defaults)"
fi

if [ -d "app" ]; then
    test_pass "app directory exists"
else
    test_fail "app directory missing"
fi

if [ -d "backend" ]; then
    test_pass "backend directory exists"
else
    test_fail "backend directory missing"
fi

# 2. Configuration Tests
echo ""
echo "⚙️  Testing Configuration..."
echo "----------------------------"

# Test app.json syntax
if node -e "JSON.parse(require('fs').readFileSync('app.json', 'utf8'))" 2>/dev/null; then
    test_pass "app.json syntax valid"
    
    # Check for required fields
    if node -e "const config = JSON.parse(require('fs').readFileSync('app.json', 'utf8')); if (!config.expo.name) throw new Error('Missing name')" 2>/dev/null; then
        test_pass "app.json has required name field"
    else
        test_fail "app.json missing required name field"
    fi
    
    if node -e "const config = JSON.parse(require('fs').readFileSync('app.json', 'utf8')); if (!config.expo.slug) throw new Error('Missing slug')" 2>/dev/null; then
        test_pass "app.json has required slug field"
    else
        test_fail "app.json missing required slug field"
    fi
    
    if node -e "const config = JSON.parse(require('fs').readFileSync('app.json', 'utf8')); if (!config.expo.version) throw new Error('Missing version')" 2>/dev/null; then
        test_pass "app.json has required version field"
    else
        test_fail "app.json missing required version field"
    fi
else
    test_fail "app.json syntax invalid"
fi

# Test eas.json syntax
if [ -f "eas.json" ]; then
    if node -e "JSON.parse(require('fs').readFileSync('eas.json', 'utf8'))" 2>/dev/null; then
        test_pass "eas.json syntax valid"
        
        # Check for problematic appleTeamId in submit section
        if grep -q '"appleTeamId"' eas.json; then
            test_warn "eas.json contains appleTeamId (may cause build issues)"
        else
            test_pass "eas.json does not contain problematic appleTeamId"
        fi
    else
        test_fail "eas.json syntax invalid"
    fi
fi

# 3. Environment Variables Tests
echo ""
echo "🌍 Testing Environment Variables..."
echo "----------------------------------"

if [ -f ".env" ]; then
    if grep -q "EXPO_PUBLIC_TRPC_URL" .env; then
        TRPC_URL=$(grep "EXPO_PUBLIC_TRPC_URL" .env | cut -d'=' -f2)
        test_pass "EXPO_PUBLIC_TRPC_URL configured: $TRPC_URL"
    else
        test_warn "EXPO_PUBLIC_TRPC_URL not found in .env"
    fi
    
    if grep -q "EXPO_PUBLIC_API_URL" .env; then
        API_URL=$(grep "EXPO_PUBLIC_API_URL" .env | cut -d'=' -f2)
        test_pass "EXPO_PUBLIC_API_URL configured: $API_URL"
    else
        test_warn "EXPO_PUBLIC_API_URL not found in .env"
    fi
    
    if grep -q "DATABASE_URL" .env; then
        test_pass "DATABASE_URL configured"
    else
        test_warn "DATABASE_URL not found in .env"
    fi
    
    if grep -q "JWT_SECRET" .env; then
        JWT_SECRET=$(grep "JWT_SECRET" .env | cut -d'=' -f2)
        if [ ${#JWT_SECRET} -ge 32 ]; then
            test_pass "JWT_SECRET configured with adequate length"
        else
            test_warn "JWT_SECRET too short (should be at least 32 characters)"
        fi
    else
        test_warn "JWT_SECRET not found in .env"
    fi
else
    test_warn ".env file not found - using defaults"
fi

# 4. Dependencies Tests
echo ""
echo "📦 Testing Dependencies..."
echo "-------------------------"

if [ -f "package.json" ]; then
    # Check for critical dependencies
    if node -e "const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8')); if (!pkg.dependencies.expo) throw new Error('Missing expo')" 2>/dev/null; then
        test_pass "Expo dependency found"
    else
        test_fail "Expo dependency missing"
    fi
    
    if node -e "const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8')); if (!pkg.dependencies['expo-router']) throw new Error('Missing expo-router')" 2>/dev/null; then
        test_pass "Expo Router dependency found"
    else
        test_fail "Expo Router dependency missing"
    fi
    
    if node -e "const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8')); if (!pkg.dependencies['@trpc/client']) throw new Error('Missing @trpc/client')" 2>/dev/null; then
        test_pass "tRPC client dependency found"
    else
        test_fail "tRPC client dependency missing"
    fi
    
    if node -e "const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8')); if (!pkg.dependencies['react-native']) throw new Error('Missing react-native')" 2>/dev/null; then
        test_pass "React Native dependency found"
    else
        test_fail "React Native dependency missing"
    fi
fi

# 5. CLI Tools Tests
echo ""
echo "🛠️  Testing CLI Tools..."
echo "------------------------"

if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    test_pass "Node.js available: $NODE_VERSION"
else
    test_fail "Node.js not found"
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    test_pass "npm available: $NPM_VERSION"
else
    test_warn "npm not found"
fi

if command -v bun >/dev/null 2>&1; then
    BUN_VERSION=$(bun --version)
    test_pass "Bun available: $BUN_VERSION"
else
    test_info "Bun not found (optional)"
fi

if command -v expo >/dev/null 2>&1; then
    test_pass "Expo CLI available"
else
    test_warn "Expo CLI not found (install with: npm install -g @expo/cli)"
fi

if command -v eas >/dev/null 2>&1; then
    test_pass "EAS CLI available"
else
    test_warn "EAS CLI not found (install with: npm install -g eas-cli)"
fi

# 6. Backend Tests
echo ""
echo "🔧 Testing Backend Configuration..."
echo "----------------------------------"

if [ -f "backend/hono.ts" ]; then
    test_pass "Backend entry point exists"
else
    test_fail "Backend entry point missing"
fi

if [ -f "backend/trpc/app-router.ts" ]; then
    test_pass "tRPC router exists"
else
    test_fail "tRPC router missing"
fi

if [ -d "backend/trpc/routes" ]; then
    test_pass "tRPC routes directory exists"
else
    test_fail "tRPC routes directory missing"
fi

if [ -f "backend/database/schema.ts" ]; then
    test_pass "Database schema exists"
else
    test_warn "Database schema missing"
fi

# 7. Frontend Tests
echo ""
echo "🎨 Testing Frontend Configuration..."
echo "-----------------------------------"

if [ -f "app/_layout.tsx" ]; then
    test_pass "Root layout exists"
else
    test_fail "Root layout missing"
fi

if [ -d "app/(tabs)" ]; then
    test_pass "Tab navigation structure exists"
else
    test_fail "Tab navigation structure missing"
fi

if [ -d "app/(auth)" ]; then
    test_pass "Auth navigation structure exists"
else
    test_fail "Auth navigation structure missing"
fi

if [ -f "lib/trpc.ts" ]; then
    test_pass "tRPC client configuration exists"
else
    test_fail "tRPC client configuration missing"
fi

if [ -d "store" ]; then
    test_pass "State management store exists"
else
    test_fail "State management store missing"
fi

if [ -d "components" ]; then
    test_pass "Components directory exists"
else
    test_fail "Components directory missing"
fi

# 8. Build Tests
echo ""
echo "🏗️  Testing Build Configuration..."
echo "---------------------------------"

# Check for common build issues
if [ -d "node_modules" ]; then
    test_pass "node_modules directory exists"
else
    test_warn "node_modules directory missing (run npm install)"
fi

if [ -f "tsconfig.json" ]; then
    test_pass "TypeScript configuration exists"
else
    test_warn "TypeScript configuration missing"
fi

# Check for problematic files
if [ -f "metro.config.js" ]; then
    test_info "Metro configuration found"
fi

if [ -f "babel.config.js" ]; then
    test_info "Babel configuration found"
fi

# 9. Security Tests
echo ""
echo "🔒 Testing Security Configuration..."
echo "-----------------------------------"

if [ -f ".gitignore" ]; then
    if grep -q ".env" .gitignore; then
        test_pass ".env is properly ignored in git"
    else
        test_warn ".env not found in .gitignore (security risk)"
    fi
else
    test_warn ".gitignore missing"
fi

if [ -f ".env" ]; then
    if grep -q "your-" .env; then
        test_warn ".env contains placeholder values (replace with real values)"
    else
        test_pass ".env appears to have real configuration values"
    fi
fi

# 10. Final Summary
echo ""
echo "📊 Test Summary"
echo "==============="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${YELLOW}⚠️  Tests with Warnings: $TESTS_WARNING${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_WARNING + TESTS_FAILED))
PASS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo "📈 Overall Pass Rate: $PASS_RATE%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    if [ $TESTS_WARNING -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed! Your app is production ready!${NC}"
    else
        echo -e "${YELLOW}🎯 Tests passed with warnings. Address warnings for optimal production readiness.${NC}"
    fi
else
    echo -e "${RED}🚨 Some tests failed. Please fix the failed tests before deploying to production.${NC}"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Fix any failed tests"
echo "2. Address warnings if possible"
echo "3. Run: ./fix-production-build.sh"
echo "4. Test build: eas build --platform ios --profile production"
echo "5. Deploy to production"
echo ""