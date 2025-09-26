#!/usr/bin/env node

/**
 * AWS Setup Script für ZestBet Backend
 * 
 * Dieses Script erstellt automatisch:
 * 1. Lambda Function
 * 2. API Gateway
 * 3. RDS PostgreSQL Datenbank
 * 4. IAM Rollen und Policies
 */

const { execSync } = require('child_process');
const fs = require('fs');

const AWS_REGION = 'eu-central-1';
const FUNCTION_NAME = 'zestbet-backend';
const API_NAME = 'zestbet-api';
const DB_NAME = 'zestbet-db';

console.log('🚀 AWS Infrastructure Setup für ZestBet');
console.log('=====================================');

async function createLambdaFunction() {
  console.log('\n📦 Erstelle Lambda Function...');
  
  // Erstelle IAM Role für Lambda
  const trustPolicy = {
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
  };
  
  fs.writeFileSync('trust-policy.json', JSON.stringify(trustPolicy, null, 2));
  
  try {
    execSync(`aws iam create-role --role-name ${FUNCTION_NAME}-role --assume-role-policy-document file://trust-policy.json --region ${AWS_REGION}`, { stdio: 'inherit' });
  } catch (_error) {
    console.log('⚠️ IAM Role existiert bereits oder Fehler beim Erstellen');
  }
  
  // Attach Basic Lambda Execution Policy
  try {
    execSync(`aws iam attach-role-policy --role-name ${FUNCTION_NAME}-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole --region ${AWS_REGION}`, { stdio: 'inherit' });
  } catch (_error) {
    console.log('⚠️ Policy bereits angehängt');
  }
  
  // Warte kurz für IAM Propagation
  console.log('⏳ Warte auf IAM Propagation...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Erstelle Lambda Function
  try {
    const accountId = execSync('aws sts get-caller-identity --query Account --output text', { encoding: 'utf8' }).trim();
    const roleArn = `arn:aws:iam::${accountId}:role/${FUNCTION_NAME}-role`;
    
    execSync(`aws lambda create-function --function-name ${FUNCTION_NAME} --runtime nodejs18.x --role ${roleArn} --handler index.handler --zip-file fileb://zestbet-lambda.zip --timeout 30 --memory-size 512 --region ${AWS_REGION}`, { stdio: 'inherit' });
    console.log('✅ Lambda Function erstellt');
  } catch (_error) {
    console.log('⚠️ Lambda Function existiert bereits, aktualisiere Code...');
    try {
      execSync(`aws lambda update-function-code --function-name ${FUNCTION_NAME} --zip-file fileb://zestbet-lambda.zip --region ${AWS_REGION}`, { stdio: 'inherit' });
      console.log('✅ Lambda Function Code aktualisiert');
    } catch (updateError) {
      console.error('❌ Fehler beim Aktualisieren der Lambda Function');
    }
  }
  
  // Cleanup
  fs.unlinkSync('trust-policy.json');
}

async function createApiGateway() {
  console.log('\n🌐 Erstelle API Gateway...');
  
  try {
    // Erstelle REST API
    const apiResult = execSync(`aws apigateway create-rest-api --name ${API_NAME} --region ${AWS_REGION} --output json`, { encoding: 'utf8' });
    const api = JSON.parse(apiResult);
    const apiId = api.id;
    
    console.log(`✅ API Gateway erstellt: ${apiId}`);
    
    // Get Root Resource ID
    const resourcesResult = execSync(`aws apigateway get-resources --rest-api-id ${apiId} --region ${AWS_REGION} --output json`, { encoding: 'utf8' });
    const resources = JSON.parse(resourcesResult);
    const rootResourceId = resources.items.find(item => item.path === '/').id;
    
    // Erstelle {proxy+} Resource
    const proxyResourceResult = execSync(`aws apigateway create-resource --rest-api-id ${apiId} --parent-id ${rootResourceId} --path-part "{proxy+}" --region ${AWS_REGION} --output json`, { encoding: 'utf8' });
    const proxyResource = JSON.parse(proxyResourceResult);
    const proxyResourceId = proxyResource.id;
    
    // Erstelle ANY Method
    execSync(`aws apigateway put-method --rest-api-id ${apiId} --resource-id ${proxyResourceId} --http-method ANY --authorization-type NONE --region ${AWS_REGION}`, { stdio: 'inherit' });
    
    // Get Account ID für Lambda ARN
    const accountId = execSync('aws sts get-caller-identity --query Account --output text', { encoding: 'utf8' }).trim();
    const lambdaArn = `arn:aws:lambda:${AWS_REGION}:${accountId}:function:${FUNCTION_NAME}`;
    
    // Setup Lambda Integration
    const integrationUri = `arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`;
    execSync(`aws apigateway put-integration --rest-api-id ${apiId} --resource-id ${proxyResourceId} --http-method ANY --type AWS_PROXY --integration-http-method POST --uri ${integrationUri} --region ${AWS_REGION}`, { stdio: 'inherit' });
    
    // Add Lambda Permission
    const sourceArn = `arn:aws:execute-api:${AWS_REGION}:${accountId}:${apiId}/*/*`;
    try {
      execSync(`aws lambda add-permission --function-name ${FUNCTION_NAME} --statement-id api-gateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn ${sourceArn} --region ${AWS_REGION}`, { stdio: 'inherit' });
    } catch (_error) {
      console.log('⚠️ Lambda Permission bereits vorhanden');
    }
    
    // Deploy API
    execSync(`aws apigateway create-deployment --rest-api-id ${apiId} --stage-name prod --region ${AWS_REGION}`, { stdio: 'inherit' });
    
    const apiUrl = `https://${apiId}.execute-api.${AWS_REGION}.amazonaws.com/prod`;
    console.log(`✅ API Gateway deployed: ${apiUrl}`);
    
    return apiUrl;
    
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des API Gateway:', error.message);
    return null;
  }
}

async function createRDSDatabase() {
  console.log('\n🗄️ Erstelle RDS PostgreSQL Datenbank...');
  
  try {
    // Erstelle DB Subnet Group
    execSync(`aws rds create-db-subnet-group --db-subnet-group-name ${DB_NAME}-subnet-group --db-subnet-group-description "Subnet group for ${DB_NAME}" --subnet-ids subnet-12345 subnet-67890 --region ${AWS_REGION}`, { stdio: 'inherit' });
  } catch (_error) {
    console.log('⚠️ DB Subnet Group existiert bereits oder Fehler');
  }
  
  try {
    // Erstelle RDS Instance
    execSync(`aws rds create-db-instance --db-instance-identifier ${DB_NAME} --db-instance-class db.t3.micro --engine postgres --master-username zestbet --master-user-password ZestBet2024! --allocated-storage 20 --vpc-security-group-ids sg-12345 --db-subnet-group-name ${DB_NAME}-subnet-group --region ${AWS_REGION}`, { stdio: 'inherit' });
    
    console.log('✅ RDS Datenbank wird erstellt (dauert ca. 10-15 Minuten)');
    console.log('⏳ Sie können den Status prüfen mit: aws rds describe-db-instances --db-instance-identifier ' + DB_NAME);
    
  } catch (_error) {
    console.log('⚠️ RDS Datenbank existiert bereits oder Fehler beim Erstellen');
    console.log('💡 Hinweis: Sie müssen möglicherweise VPC und Security Groups manuell konfigurieren');
  }
}

async function updateEnvironmentVariables(apiUrl) {
  console.log('\n🔧 Aktualisiere Environment Variables...');
  
  if (!apiUrl) {
    console.log('⚠️ Keine API URL verfügbar, überspringe Environment Update');
    return;
  }
  
  // Erstelle .env für lokale Entwicklung
  const envContent = `# AWS Production Environment
EXPO_PUBLIC_API_URL=${apiUrl}/api
EXPO_PUBLIC_TRPC_URL=${apiUrl}/api/trpc

# Database (wird nach RDS Setup aktualisiert)
DATABASE_URL=postgresql://zestbet:ZestBet2024!@${DB_NAME}.cluster-xyz.${AWS_REGION}.rds.amazonaws.com:5432/zestbet

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-${Date.now()}
JWT_EXPIRES_IN=7d

# AWS
AWS_REGION=${AWS_REGION}
NODE_ENV=production
`;
  
  fs.writeFileSync('.env.production', envContent);
  console.log('✅ .env.production erstellt');
  
  // Update Lambda Environment Variables
  try {
    const envVars = {
      Variables: {
        NODE_ENV: 'production',
        JWT_SECRET: `your-super-secret-jwt-key-${Date.now()}`,
        JWT_EXPIRES_IN: '7d',
        AWS_REGION: AWS_REGION
      }
    };
    
    fs.writeFileSync('lambda-env.json', JSON.stringify(envVars, null, 2));
    execSync(`aws lambda update-function-configuration --function-name ${FUNCTION_NAME} --environment file://lambda-env.json --region ${AWS_REGION}`, { stdio: 'inherit' });
    fs.unlinkSync('lambda-env.json');
    
    console.log('✅ Lambda Environment Variables aktualisiert');
  } catch (_error) {
    console.log('⚠️ Fehler beim Aktualisieren der Lambda Environment Variables');
  }
}

async function main() {
  try {
    // Prüfe ob ZIP File existiert
    if (!fs.existsSync('zestbet-lambda.zip')) {
      console.log('❌ zestbet-lambda.zip nicht gefunden');
      console.log('Führen Sie zuerst aus: node aws-lambda-deploy.js');
      process.exit(1);
    }
    
    await createLambdaFunction();
    const apiUrl = await createApiGateway();
    await createRDSDatabase();
    await updateEnvironmentVariables(apiUrl);
    
    console.log('\n🎉 AWS Setup abgeschlossen!');
    console.log('===============================');
    
    if (apiUrl) {
      console.log(`🌐 API URL: ${apiUrl}/api`);
      console.log(`🔗 tRPC URL: ${apiUrl}/api/trpc`);
      console.log(`🏥 Health Check: ${apiUrl}/api/status`);
    }
    
    console.log('\n📋 Nächste Schritte:');
    console.log('1. Warten Sie bis die RDS Datenbank bereit ist (10-15 Min)');
    console.log('2. Aktualisieren Sie die DATABASE_URL in .env.production');
    console.log('3. Führen Sie die Datenbank Migration aus');
    console.log('4. Testen Sie die API mit: curl ' + (apiUrl || 'YOUR_API_URL') + '/api/status');
    
  } catch (error) {
    console.error('❌ Fehler beim AWS Setup:', error.message);
    process.exit(1);
  }
}

main();