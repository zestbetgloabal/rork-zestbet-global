#!/bin/bash
set -e

echo "🔄 Starting database migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set!"
  echo "Please set DATABASE_URL environment variable"
  exit 1
fi

echo "✅ DATABASE_URL is configured"
echo "🔄 Running migration..."

# Run the SQL migration file
psql "$DATABASE_URL" -f backend/database/migrate.sql

echo "✅ Database migration completed successfully!"
echo "🎉 All tables and test data have been created!"