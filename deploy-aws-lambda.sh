#!/bin/bash

echo "🚀 Deploying ZestBet Backend to AWS Lambda..."

# Check if serverless is installed
if ! command -v serverless &> /dev/null; then
    echo "❌ Serverless Framework not found. Installing..."
    npm install -g serverless
fi

# Check if serverless-esbuild plugin is installed
if ! npm list serverless-esbuild &> /dev/null; then
    echo "📦 Installing serverless-esbuild plugin..."
    npm install --save-dev serverless-esbuild
fi

# Load environment variables
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found. Make sure environment variables are set."
fi

# Deploy to AWS Lambda
echo "🚀 Deploying to AWS Lambda..."
serverless deploy --stage prod

# Get the deployed API endpoint
echo "✅ Deployment complete!"
echo "📋 Getting API endpoint..."
serverless info --stage prod

echo ""
echo "🎉 Your ZestBet API is now deployed to AWS Lambda!"
echo ""
echo "Next steps:"
echo "1. Copy the API Gateway endpoint URL from above"
echo "2. Update your .env file with the new AWS Lambda URL"
echo "3. Update eas.json production environment variables"
echo "4. Test your API endpoints"
echo ""
echo "Example URLs:"
echo "- Health Check: https://your-api-id.execute-api.eu-central-1.amazonaws.com/"
echo "- tRPC Endpoint: https://your-api-id.execute-api.eu-central-1.amazonaws.com/trpc"