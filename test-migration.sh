#!/bin/bash

# 🧪 Test Migration Script
# Quick test to verify the migration script works

echo "🧪 Testing Database Migration Script"
echo "===================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please make sure .env file exists with DATABASE_URL"
    exit 1
fi

# Load environment variables
source .env

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in .env file!"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "🔗 Database: $(echo $DATABASE_URL | sed 's/:[^@]*@/@***/g')"
echo ""

# Test Node.js and required packages
echo "📦 Checking Node.js and dependencies..."
node --version
npm list pg dotenv --depth=0 2>/dev/null || echo "⚠️ Some dependencies may be missing"
echo ""

# Run the migration
echo "🔄 Running database migration..."
echo "Command: node backend/database/migrate.js"
echo ""

node backend/database/migrate.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Migration test completed successfully!"
    echo "✅ Database is ready!"
else
    echo ""
    echo "❌ Migration test failed!"
    echo "Please check the error messages above."
    exit 1
fi