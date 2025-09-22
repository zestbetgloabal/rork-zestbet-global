#!/bin/bash

# ZestBet Lambda Deployment Script
echo "🚀 Deploying ZestBet API to AWS Lambda..."

# Navigate to Lambda directory
cd lambda/zestbetApi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create deployment package
echo "📦 Creating deployment package..."
zip -r zestbet-api.zip . -x "*.git*" "node_modules/.cache/*" "*.DS_Store*"

# Deploy to AWS Lambda (you need to configure AWS CLI first)
echo "🚀 Deploying to AWS Lambda..."
aws lambda update-function-code \
  --function-name zestbet-api \
  --zip-file fileb://zestbet-api.zip

echo "✅ Deployment complete!"
echo "🔗 Your API Gateway URL should be configured to point to this Lambda function"
echo "📝 Don't forget to set environment variables in Lambda console if needed"