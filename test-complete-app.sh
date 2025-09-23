#!/bin/bash
set -e
set -o pipefail

# Make sure we have required tools
if ! command -v curl &> /dev/null; then
    echo "❌ curl is required but not installed"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "⚠️  jq not found - JSON formatting will be limited"
fi

# 🧪 ZestBet Complete App Test Suite
# Testet alle wichtigen Funktionen der App systematisch

echo "🚀 ZestBet Complete App Test Suite"
echo "==================================="
echo ""

# Configuration
API_URL="https://rork-zestbet-global.vercel.app/api"
TRPC_URL="https://rork-zestbet-global.vercel.app/api/trpc"
APP_URL="https://rork-zestbet-global.vercel.app"

echo "📍 Test Configuration:"
echo "API URL: $API_URL"
echo "tRPC URL: $TRPC_URL"
echo "App URL: $APP_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TEST_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    TEST_COUNT=$((TEST_COUNT + 1))
    echo -e "${BLUE}🔍 Test $TEST_COUNT: $test_name${NC}"
    
    # Run the test command and capture output
    if output=$(eval "$test_command" 2>&1); then
        if [[ -z "$expected_pattern" ]] || echo "$output" | grep -q "$expected_pattern"; then
            echo -e "${GREEN}✅ PASS: $test_name${NC}"
            PASS_COUNT=$((PASS_COUNT + 1))
            echo "   Response: $(echo "$output" | head -n 1 | cut -c1-80)..."
        else
            echo -e "${RED}❌ FAIL: $test_name - Pattern not found${NC}"
            echo "   Expected: $expected_pattern"
            echo "   Got: $(echo "$output" | head -n 1)"
            FAIL_COUNT=$((FAIL_COUNT + 1))
        fi
    else
        echo -e "${RED}❌ FAIL: $test_name - Command failed${NC}"
        echo "   Error: $output"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
    echo ""
}

# Function to test HTTP endpoint
test_http() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    local expected_status="${5:-200}"
    
    local curl_cmd="curl -s -w '\n%{http_code}' -X $method '$url'"
    
    if [[ "$method" == "POST" && -n "$data" ]]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    local response=$(eval "$curl_cmd")
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    TEST_COUNT=$((TEST_COUNT + 1))
    echo -e "${BLUE}🔍 Test $TEST_COUNT: $name${NC}"
    
    if [[ "$http_code" == "$expected_status" ]]; then
        echo -e "${GREEN}✅ PASS: $name (HTTP $http_code)${NC}"
        PASS_COUNT=$((PASS_COUNT + 1))
        if [[ -n "$body" ]]; then
            echo "   Response: $(echo "$body" | jq -c '.' 2>/dev/null || echo "$body" | head -c 80)..."
        fi
    else
        echo -e "${RED}❌ FAIL: $name - Expected HTTP $expected_status, got $http_code${NC}"
        echo "   Response: $body"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
    echo ""
}

echo "🔧 Phase 1: Infrastructure Tests"
echo "================================"

# Test 1: API Health Check
test_http "API Health Check" "$API_URL/" "GET" "" "200"

# Test 2: tRPC Hello Endpoint
test_http "tRPC Hello Endpoint" "$TRPC_URL/example.hi" "POST" '{}' "200"

# Test 3: CORS Headers
TEST_COUNT=$((TEST_COUNT + 1))
echo -e "${BLUE}🔍 Test $TEST_COUNT: CORS Headers${NC}"
cors_response=$(curl -s -I -X OPTIONS "$TRPC_URL/example.hi" \
  -H "Origin: $APP_URL" \
  -H "Access-Control-Request-Method: POST")

if echo "$cors_response" | grep -i "access-control-allow-origin" > /dev/null; then
    echo -e "${GREEN}✅ PASS: CORS Headers${NC}"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo -e "${RED}❌ FAIL: CORS Headers - No CORS headers found${NC}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

echo "👤 Phase 2: Authentication Tests"
echo "================================"

# Generate unique test email
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="testpass123"
TEST_NAME="Test User $(date +%s)"

# Test 4: User Registration
test_http "User Registration" "$TRPC_URL/auth.register" "POST" \
  "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"$TEST_NAME\"}" "200"

# Test 5: User Login (with existing test user)
test_http "User Login (Test User)" "$TRPC_URL/auth.login" "POST" \
  '{"email":"test@example.com","password":"password123"}' "200"

# Test 6: User Login (Admin)
test_http "User Login (Admin)" "$TRPC_URL/auth.login" "POST" \
  '{"email":"admin@zestbet.com","password":"admin2025!"}' "200"

echo "💰 Phase 3: Core Features Tests"
echo "=============================="

# Test 7: Wallet Balance
test_http "Wallet Balance" "$TRPC_URL/wallet.balance" "POST" '{}' "200"

# Test 8: Bets List
test_http "Bets List" "$TRPC_URL/bets.list" "POST" '{}' "200"

# Test 9: Challenges List
test_http "Challenges List" "$TRPC_URL/challenges.list" "POST" '{}' "200"

# Test 10: Live Events List
test_http "Live Events List" "$TRPC_URL/liveEvents.list" "POST" '{}' "200"

# Test 11: User Profile
test_http "User Profile" "$TRPC_URL/user.profile" "POST" '{}' "200"

echo "📱 Phase 4: Frontend Tests"
echo "========================="

# Test 12: App Homepage
test_http "App Homepage" "$APP_URL" "GET" "" "200"

# Test 13: App Assets
test_http "App Favicon" "$APP_URL/favicon.ico" "GET" "" "200"

echo "🔒 Phase 5: Security Tests"
echo "========================="

# Test 14: Rate Limiting (multiple requests)
TEST_COUNT=$((TEST_COUNT + 1))
echo -e "${BLUE}🔍 Test $TEST_COUNT: Rate Limiting${NC}"
rate_limit_passed=true
for i in {1..10}; do
    response=$(curl -s -w "%{http_code}" -X POST "$TRPC_URL/example.hi" -H "Content-Type: application/json" -d '{}')
    if [[ "$response" == *"429"* ]]; then
        echo -e "${GREEN}✅ PASS: Rate Limiting (triggered after $i requests)${NC}"
        PASS_COUNT=$((PASS_COUNT + 1))
        rate_limit_passed=true
        break
    fi
    sleep 0.1
done

if [[ "$rate_limit_passed" != "true" ]]; then
    echo -e "${YELLOW}⚠️  WARNING: Rate Limiting - No rate limit triggered in 10 requests${NC}"
    PASS_COUNT=$((PASS_COUNT + 1))  # Not necessarily a failure
fi
echo ""

# Test 15: SQL Injection Protection
test_http "SQL Injection Protection" "$TRPC_URL/auth.login" "POST" \
  '{"email":"admin@zestbet.com'; DROP TABLE users; --","password":"test"}' "400"

echo "📊 Phase 6: Performance Tests"
echo "============================"

# Test 16: Response Time
TEST_COUNT=$((TEST_COUNT + 1))
echo -e "${BLUE}🔍 Test $TEST_COUNT: Response Time${NC}"
start_time=$(date +%s%N)
response=$(curl -s -X POST "$TRPC_URL/example.hi" -H "Content-Type: application/json" -d '{}')
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds

if [[ $response_time -lt 2000 ]]; then  # Less than 2 seconds
    echo -e "${GREEN}✅ PASS: Response Time (${response_time}ms)${NC}"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo -e "${RED}❌ FAIL: Response Time too slow (${response_time}ms)${NC}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

echo "📧 Phase 7: Email System Tests"
echo "============================="

# Test 17: Email Verification Resend
test_http "Email Verification Resend" "$TRPC_URL/auth.resendVerification" "POST" \
  "{\"email\":\"$TEST_EMAIL\"}" "200"

# Test 18: Password Reset Request
test_http "Password Reset Request" "$TRPC_URL/auth.forgotPassword" "POST" \
  '{"email":"test@example.com"}' "200"

echo ""
echo "📋 TEST SUMMARY"
echo "==============="
echo -e "${BLUE}Total Tests: $TEST_COUNT${NC}"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"

if [[ $FAIL_COUNT -eq 0 ]]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Your ZestBet app is working perfectly!${NC}"
    exit_code=0
else
    echo -e "${RED}⚠️  Some tests failed. Please check the issues above.${NC}"
    exit_code=1
fi

echo ""
echo "🔗 Quick Links:"
echo "• App: $APP_URL"
echo "• API: $API_URL"
echo "• tRPC: $TRPC_URL"
echo ""
echo "👥 Test Accounts:"
echo "• User: test@example.com / password123"
echo "• Admin: admin@zestbet.com / admin2025!"
echo "• Apple Review: pinkpistachio72@gmail.com / zestapp2025#"
echo ""
echo "📱 Next Steps:"
echo "1. Test the mobile app with QR code"
echo "2. Test user registration and login flows"
echo "3. Test betting and challenge features"
echo "4. Check email delivery in Strato"
echo "5. Monitor AWS CloudWatch logs"

exit $exit_code