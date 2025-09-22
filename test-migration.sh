#!/bin/bash

# Quick test to verify the migration script works
echo "🧪 Testing migration script..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this from the project root directory"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

echo "✅ Environment check passed"
echo "🔄 Running migration test..."

# Run the migration
node backend/database/migrate.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Migration test successful!"
else
    echo ""
    echo "❌ Migration test failed!"
    exit 1
fi