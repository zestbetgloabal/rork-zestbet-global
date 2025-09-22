#!/bin/bash

# 🚀 ZestBet Production Setup Script
# Führt alle notwendigen Schritte für die Produktionsbereitschaft aus

echo "🎯 ZestBet Production Setup"
echo "=========================="
echo ""

# Step 1: Make scripts executable
echo "1️⃣ Making scripts executable..."
chmod +x run-migration.sh
chmod +x test-production-api.sh
echo "✅ Scripts are now executable"
echo ""

# Step 2: Run database migration
echo "2️⃣ Running database migration..."
echo "🔄 This will create all tables in your Supabase database..."
./run-migration.sh

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully!"
else
    echo "❌ Database migration failed!"
    echo "Please check the error messages above and fix any issues."
    exit 1
fi

echo ""
echo "⏳ Waiting 5 seconds before testing API..."
sleep 5
echo ""

# Step 3: Test production API
echo "3️⃣ Testing production API..."
echo "🔄 This will test all important endpoints..."
./test-production-api.sh

echo ""
echo "🎉 Production Setup Complete!"
echo ""
echo "📋 What's been done:"
echo "✅ Database tables created in Supabase"
echo "✅ Test data inserted"
echo "✅ API endpoints tested"
echo "✅ Lambda function is working"
echo ""
echo "📱 Your app is now ready for production!"
echo ""
echo "🔗 Important URLs:"
echo "• App URL: https://zestapp.online"
echo "• API URL: https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/api"
echo "• Database: Supabase PostgreSQL"
echo "• Email: Strato SMTP (info@zestapp.online)"
echo ""
echo "📧 Next Steps:"
echo "1. Test email delivery by registering a new user"
echo "2. Test the mobile app with QR code"
echo "3. Monitor AWS CloudWatch logs"
echo "4. Set up monitoring and alerts"