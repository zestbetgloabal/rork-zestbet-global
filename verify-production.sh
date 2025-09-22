#!/bin/bash

# 🔍 ZestBet Production Verification
# Schnelle Überprüfung aller Produktionskomponenten

echo "🔍 ZestBet Production Verification"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check status
check_status() {
    local name="$1"
    local command="$2"
    local expected="$3"
    
    echo -n "Checking $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to test HTTP endpoint
test_http() {
    local name="$1"
    local url="$2"
    local expected_code="${3:-200}"
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "%{http_code}" "$url" -o /dev/null)
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✅ HTTP $response${NC}"
        return 0
    else
        echo -e "${RED}❌ HTTP $response${NC}"
        return 1
    fi
}

# Check environment file
check_status "Environment file" "[ -f .env ]"

# Load environment
if [ -f ".env" ]; then
    source .env
    check_status "DATABASE_URL" "[ -n '$DATABASE_URL' ]"
    check_status "JWT_SECRET" "[ -n '$JWT_SECRET' ]"
    check_status "EMAIL_FROM" "[ -n '$EMAIL_FROM' ]"
fi

# Check scripts
check_status "Migration script" "[ -x run-migration.sh ]"
check_status "API test script" "[ -x test-production-api.sh ]"

# Check dependencies
check_status "Node modules" "[ -d node_modules ]"
check_status "pg package" "npm list pg > /dev/null 2>&1"
check_status "drizzle-orm package" "npm list drizzle-orm > /dev/null 2>&1"

echo ""
echo "🌐 Testing Production Endpoints:"
echo "=============================="

# Test production endpoints
API_URL="https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/api"
TRPC_URL="https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/api/trpc"

test_http "Lambda Health Check" "$API_URL/"
test_http "tRPC Hello Endpoint" "$TRPC_URL/example.hi" "200"

echo ""
echo "📊 Database Connection Test:"
echo "============================"

if [ -n "$DATABASE_URL" ]; then
    echo -n "Testing database connection... "
    
    # Simple connection test using node
    node -e "
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: '$DATABASE_URL', ssl: { rejectUnauthorized: false } });
        pool.query('SELECT NOW()').then(() => {
            console.log('\\x1b[32m✅ Connected\\x1b[0m');
            process.exit(0);
        }).catch(err => {
            console.log('\\x1b[31m❌ Failed:', err.message, '\\x1b[0m');
            process.exit(1);
        });
    " 2>/dev/null
else
    echo -e "${YELLOW}⚠️ DATABASE_URL not found${NC}"
fi

echo ""
echo "📧 Email Configuration:"
echo "====================="

if [ -n "$EMAIL_FROM" ] && [ -n "$SMTP_HOST" ]; then
    echo -e "${GREEN}✅ Email configured${NC}"
    echo "   From: $EMAIL_FROM"
    echo "   SMTP: $SMTP_HOST"
else
    echo -e "${RED}❌ Email not configured${NC}"
fi

echo ""
echo "📋 Production Status Summary:"
echo "=============================="
echo "🔗 App URL: https://zestapp.online"
echo "🔗 API URL: $API_URL"
echo "🔗 tRPC URL: $TRPC_URL"
echo ""
echo "🚀 Ready for production testing!"
echo "Use './complete-production-setup.sh' to run full setup if needed."
echo ""