#!/bin/bash

# ZestBet Backend Deployment Script for AWS Amplify

echo "🚀 Starting ZestBet Backend Deployment..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo "❌ Amplify CLI is not installed. Installing..."
    npm install -g @aws-amplify/cli
fi

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if amplify is initialized
if [ ! -d "amplify" ]; then
    echo "🔧 Initializing Amplify project..."
    amplify init --yes
fi

# Add API if not exists
if [ ! -f "amplify/backend/api/zestbetapi/template.json" ]; then
    echo "🔌 Adding API..."
    amplify add api
fi

# Set environment variables
echo "🔐 Setting environment variables..."
amplify env add production

# Deploy to AWS
echo "☁️ Deploying to AWS..."
amplify push --yes

echo "✅ Deployment completed successfully!"
echo "🌐 Your API is now available at the Amplify endpoint."

# Display useful information
echo ""
echo "📋 Next Steps:"
echo "1. Update your frontend to use the new API endpoint"
echo "2. Configure your environment variables in AWS Lambda"
echo "3. Set up your database connection"
echo "4. Configure OAuth providers"
echo "5. Set up payment providers (Stripe, PayPal)"
echo ""
echo "📚 For more information, check README-Backend.md"