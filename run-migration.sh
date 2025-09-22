#!/bin/bash

# 🗄️ ZestBet Database Migration Script
# Führt die Datenbank-Migration für Supabase PostgreSQL aus

echo "🔄 Starting ZestBet Database Migration..."
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

# Install required dependencies if not present
echo "📦 Checking dependencies..."
npm list pg drizzle-orm dotenv > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "📦 Installing required dependencies..."
    npm install pg drizzle-orm dotenv
fi

# Run the migration
echo "🔄 Running database migration..."
cd backend/database
node migrate.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Database migration completed successfully!"
    echo "✅ All tables created"
    echo "✅ Test data inserted"
    echo "✅ Database is ready for production!"
else
    echo ""
    echo "❌ Database migration failed!"
    echo "Please check the error messages above."
    exit 1
fi