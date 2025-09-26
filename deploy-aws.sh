#!/bin/bash

# AWS Lambda Deployment Script für ZestBet Backend
# Automatisiert das komplette Deployment auf AWS

set -e

echo "🚀 ZestBet AWS Lambda Deployment"
echo "================================"

# Prüfe Voraussetzungen
echo "🔍 Prüfe Voraussetzungen..."

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI ist nicht installiert"
    echo "Installation: https://aws.amazon.com/cli/"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert"
    exit 1
fi

if ! command -v zip &> /dev/null; then
    echo "❌ zip ist nicht installiert"
    exit 1
fi

# Prüfe AWS Credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS Credentials sind nicht konfiguriert"
    echo "Führen Sie aus: aws configure"
    exit 1
fi

echo "✅ Alle Voraussetzungen erfüllt"

# Konfiguration
AWS_REGION="eu-central-1"
FUNCTION_NAME="zestbet-backend"
API_NAME="zestbet-api"
LAMBDA_RUNTIME="nodejs18.x"
LAMBDA_TIMEOUT=30
LAMBDA_MEMORY=512

echo "📦 Erstelle Lambda Deployment Package..."

# Erstelle temporäres Verzeichnis
TEMP_DIR="lambda-deploy-$(date +%s)"
mkdir -p $TEMP_DIR

# Kopiere Backend Code
cp -r backend/* $TEMP_DIR/
cp lambda-handler.js $TEMP_DIR/index.js

# Erstelle package.json für Lambda
cat > $TEMP_DIR/package.json << EOF
{
  "name": "zestbet-lambda",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "dependencies": {
    "hono": "^4.7.10",
    "@hono/trpc-server": "^0.3.4",
    "@trpc/server": "^11.1.3",
    "drizzle-orm": "^0.44.5",
    "pg": "^8.16.3",
    "bcryptjs": "^3.0.2",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.25.30",
    "superjson": "^2.2.2",
    "@aws-sdk/client-ses": "^3.893.0",
    "dotenv": "^17.2.2"
  }
}
EOF

# Installiere Dependencies
echo "📥 Installiere Dependencies..."
cd $TEMP_DIR
npm install --production --silent
cd ..

# Erstelle ZIP Archive
echo "🗜️ Erstelle ZIP Archive..."
cd $TEMP_DIR
zip -r ../zestbet-lambda.zip . -q
cd ..

# Cleanup temp directory
rm -rf $TEMP_DIR

echo "✅ Lambda Package erstellt: zestbet-lambda.zip"

# Erstelle oder aktualisiere Lambda Function
echo "☁️ Deploye Lambda Function..."

# Prüfe ob Function existiert
if aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION &> /dev/null; then
    echo "🔄 Aktualisiere bestehende Lambda Function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://zestbet-lambda.zip \
        --region $AWS_REGION \
        --output table
else
    echo "🆕 Erstelle neue Lambda Function..."
    
    # Erstelle IAM Role falls nicht vorhanden
    ROLE_NAME="${FUNCTION_NAME}-role"
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
    
    if ! aws iam get-role --role-name $ROLE_NAME &> /dev/null; then
        echo "🔐 Erstelle IAM Role..."
        
        # Trust Policy
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
            --assume-role-policy-document file://trust-policy.json \
            --region $AWS_REGION
        
        # Attach Basic Execution Policy
        aws iam attach-role-policy \
            --role-name $ROLE_NAME \
            --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
        
        # Cleanup
        rm trust-policy.json
        
        echo "⏳ Warte auf IAM Propagation..."
        sleep 10
    fi
    
    # Erstelle Lambda Function
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $LAMBDA_RUNTIME \
        --role $ROLE_ARN \
        --handler index.handler \
        --zip-file fileb://zestbet-lambda.zip \
        --timeout $LAMBDA_TIMEOUT \
        --memory-size $LAMBDA_MEMORY \
        --region $AWS_REGION \
        --output table
fi

# Erstelle oder aktualisiere API Gateway
echo "🌐 Setup API Gateway..."

# Prüfe ob API existiert
API_ID=$(aws apigateway get-rest-apis --region $AWS_REGION --query "items[?name=='$API_NAME'].id" --output text)

if [ -z "$API_ID" ] || [ "$API_ID" == "None" ]; then
    echo "🆕 Erstelle neues API Gateway..."
    
    # Erstelle REST API
    API_ID=$(aws apigateway create-rest-api \
        --name $API_NAME \
        --region $AWS_REGION \
        --query 'id' \
        --output text)
    
    echo "✅ API Gateway erstellt: $API_ID"
    
    # Get Root Resource ID
    ROOT_RESOURCE_ID=$(aws apigateway get-resources \
        --rest-api-id $API_ID \
        --region $AWS_REGION \
        --query 'items[?path==`/`].id' \
        --output text)
    
    # Erstelle {proxy+} Resource
    PROXY_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id $API_ID \
        --parent-id $ROOT_RESOURCE_ID \
        --path-part "{proxy+}" \
        --region $AWS_REGION \
        --query 'id' \
        --output text)
    
    # Erstelle ANY Method
    aws apigateway put-method \
        --rest-api-id $API_ID \
        --resource-id $PROXY_RESOURCE_ID \
        --http-method ANY \
        --authorization-type NONE \
        --region $AWS_REGION
    
    # Setup Lambda Integration
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    LAMBDA_ARN="arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"
    INTEGRATION_URI="arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations"
    
    aws apigateway put-integration \
        --rest-api-id $API_ID \
        --resource-id $PROXY_RESOURCE_ID \
        --http-method ANY \
        --type AWS_PROXY \
        --integration-http-method POST \
        --uri $INTEGRATION_URI \
        --region $AWS_REGION
    
    # Add Lambda Permission
    SOURCE_ARN="arn:aws:execute-api:${AWS_REGION}:${ACCOUNT_ID}:${API_ID}/*/*"
    aws lambda add-permission \
        --function-name $FUNCTION_NAME \
        --statement-id api-gateway-invoke-$(date +%s) \
        --action lambda:InvokeFunction \
        --principal apigateway.amazonaws.com \
        --source-arn $SOURCE_ARN \
        --region $AWS_REGION || true
    
    # Deploy API
    aws apigateway create-deployment \
        --rest-api-id $API_ID \
        --stage-name prod \
        --region $AWS_REGION
    
    echo "✅ API Gateway deployed"
else
    echo "🔄 API Gateway existiert bereits: $API_ID"
    
    # Redeploy
    aws apigateway create-deployment \
        --rest-api-id $API_ID \
        --stage-name prod \
        --region $AWS_REGION
    
    echo "✅ API Gateway redeployed"
fi

# Generiere URLs
API_URL="https://${API_ID}.execute-api.${AWS_REGION}.amazonaws.com/prod"

echo ""
echo "🎉 Deployment erfolgreich abgeschlossen!"
echo "========================================"
echo ""
echo "📍 API Endpoints:"
echo "   Base URL:     $API_URL"
echo "   API URL:      $API_URL/api"
echo "   tRPC URL:     $API_URL/api/trpc"
echo "   Health Check: $API_URL/api/status"
echo ""
echo "🔧 Environment Variables für .env:"
echo "   EXPO_PUBLIC_API_URL=$API_URL/api"
echo "   EXPO_PUBLIC_TRPC_URL=$API_URL/api/trpc"
echo ""

# Erstelle .env.production
cat > .env.production << EOF
# AWS Production Environment
EXPO_PUBLIC_API_URL=$API_URL/api
EXPO_PUBLIC_TRPC_URL=$API_URL/api/trpc

# Database (aktualisieren Sie diese nach RDS Setup)
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/zestbet

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(date +%s)
JWT_EXPIRES_IN=7d

# AWS
AWS_REGION=$AWS_REGION
NODE_ENV=production
EOF

echo "✅ .env.production erstellt"

# Test API
echo ""
echo "🧪 Teste API..."
if curl -s "$API_URL/api/status" | grep -q "healthy"; then
    echo "✅ API ist erreichbar und funktioniert"
else
    echo "⚠️ API Test fehlgeschlagen - prüfen Sie die Logs"
fi

echo ""
echo "📋 Nächste Schritte:"
echo "1. Aktualisieren Sie DATABASE_URL in .env.production"
echo "2. Führen Sie Datenbank Migrationen aus"
echo "3. Testen Sie alle Endpoints"
echo "4. Aktualisieren Sie Ihre App mit den neuen URLs"

# Cleanup
rm -f zestbet-lambda.zip

echo ""
echo "🏁 Deployment abgeschlossen!"