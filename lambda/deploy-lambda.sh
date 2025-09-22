#!/bin/bash

# ZestBet Lambda Deployment Script
# This script packages and deploys your Lambda function

set -e

echo "🚀 Starting ZestBet Lambda deployment..."

# Configuration
FUNCTION_NAME="zestbet-api"
REGION="eu-central-1"
RUNTIME="nodejs18.x"
HANDLER="index.handler"
ROLE_NAME="zestbet-lambda-role"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "zestbetApi/index.js" ]; then
    print_error "Please run this script from the lambda directory"
    exit 1
fi

cd zestbetApi

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    print_status "Installing dependencies..."
    npm install --production
else
    print_warning "No package.json found, skipping dependency installation"
fi

# Create deployment package
print_status "Creating deployment package..."
zip -r ../zestbet-api.zip . -x "*.git*" "node_modules/.cache/*" "*.DS_Store*"

cd ..

# Check if Lambda function exists
print_status "Checking if Lambda function exists..."
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION &> /dev/null; then
    print_status "Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://zestbet-api.zip \
        --region $REGION
    
    print_status "Updating function configuration..."
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --handler $HANDLER \
        --timeout 30 \
        --memory-size 512 \
        --region $REGION
else
    print_warning "Lambda function doesn't exist. Creating new function..."
    
    # Check if IAM role exists
    if ! aws iam get-role --role-name $ROLE_NAME &> /dev/null; then
        print_status "Creating IAM role..."
        
        # Create trust policy
        cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
        
        aws iam create-role \
            --role-name $ROLE_NAME \
            --assume-role-policy-document file://trust-policy.json
        
        # Attach basic execution policy
        aws iam attach-role-policy \
            --role-name $ROLE_NAME \
            --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
        
        rm trust-policy.json
        
        print_status "Waiting for IAM role to be ready..."
        sleep 10
    fi
    
    # Get role ARN
    ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
    
    print_status "Creating Lambda function..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role $ROLE_ARN \
        --handler $HANDLER \
        --zip-file fileb://zestbet-api.zip \
        --timeout 30 \
        --memory-size 512 \
        --region $REGION
fi

# Clean up
rm zestbet-api.zip

# Get function URL if it exists
print_status "Checking for function URL..."
FUNCTION_URL=$(aws lambda get-function-url-config --function-name $FUNCTION_NAME --region $REGION --query 'FunctionUrl' --output text 2>/dev/null || echo "")

if [ -z "$FUNCTION_URL" ]; then
    print_status "Creating function URL..."
    FUNCTION_URL=$(aws lambda create-function-url-config \
        --function-name $FUNCTION_NAME \
        --cors '{"AllowCredentials":true,"AllowHeaders":["*"],"AllowMethods":["*"],"AllowOrigins":["*"]}' \
        --auth-type NONE \
        --region $REGION \
        --query 'FunctionUrl' --output text)
fi

print_status "Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   Function Name: $FUNCTION_NAME"
echo "   Region: $REGION"
echo "   Function URL: $FUNCTION_URL"
echo ""
echo "🔧 Next Steps:"
echo "   1. Update your .env file with:"
echo "      EXPO_PUBLIC_API_URL=$FUNCTION_URL"
echo "   2. Test your API at: ${FUNCTION_URL}"
echo "   3. Test tRPC at: ${FUNCTION_URL}trpc"
echo ""
print_status "Ready to use! 🎉"