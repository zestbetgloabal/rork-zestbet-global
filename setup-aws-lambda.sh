#!/bin/bash

echo "🔧 Setting up AWS Lambda deployment for ZestBet..."

# Install AWS CLI if not present
if ! command -v aws &> /dev/null; then
    echo "📦 Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi

# Install Serverless Framework globally
echo "📦 Installing Serverless Framework..."
npm install -g serverless

# Install required dependencies for Lambda
echo "📦 Installing Lambda dependencies..."
npm install --save-dev serverless-esbuild

# Create AWS credentials if not exist
if [ ! -f ~/.aws/credentials ]; then
    echo "⚙️  AWS credentials not found. Please configure AWS CLI:"
    echo "Run: aws configure"
    echo "You'll need:"
    echo "- AWS Access Key ID"
    echo "- AWS Secret Access Key"
    echo "- Default region: eu-central-1"
    echo "- Default output format: json"
    exit 1
fi

# Make deployment script executable
chmod +x deploy-aws-lambda.sh

echo "✅ AWS Lambda setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure AWS credentials: aws configure"
echo "2. Run deployment: ./deploy-aws-lambda.sh"
echo "3. Update your app configuration with the new API endpoint"