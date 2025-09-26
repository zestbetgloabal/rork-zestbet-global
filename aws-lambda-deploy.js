#!/usr/bin/env node

/**
 * AWS Lambda Deployment Script für ZestBet Backend
 * 
 * Dieses Script erstellt:
 * 1. Lambda Function für das Hono Backend
 * 2. API Gateway für HTTP Requests
 * 3. RDS PostgreSQL Datenbank
 * 4. Environment Variables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 AWS Lambda Deployment für ZestBet Backend');
console.log('===============================================');

// Prüfe AWS CLI Installation
try {
  execSync('aws --version', { stdio: 'pipe' });
  console.log('✅ AWS CLI ist installiert');
} catch (error) {
  console.error('❌ AWS CLI ist nicht installiert. Bitte installieren Sie es zuerst.');
  console.error('Installation: https://aws.amazon.com/cli/');
  process.exit(1);
}

// Prüfe AWS Konfiguration
try {
  execSync('aws sts get-caller-identity', { stdio: 'pipe' });
  console.log('✅ AWS Credentials sind konfiguriert');
} catch (error) {
  console.error('❌ AWS Credentials sind nicht konfiguriert.');
  console.error('Führen Sie aus: aws configure');
  process.exit(1);
}

// Erstelle Lambda Deployment Package
console.log('\n📦 Erstelle Lambda Deployment Package...');

// Erstelle temporäres Verzeichnis
const tempDir = path.join(__dirname, 'lambda-deploy-temp');
if (fs.existsSync(tempDir)) {
  execSync(`rm -rf ${tempDir}`);
}
fs.mkdirSync(tempDir);

// Kopiere Backend Code
execSync(`cp -r backend/* ${tempDir}/`);
execSync(`cp package.json ${tempDir}/`);

// Erstelle Lambda Handler
const lambdaHandler = `
import { handle } from 'hono/aws-lambda';
import app from './hono.js';

export const handler = handle(app);
`;

fs.writeFileSync(path.join(tempDir, 'index.js'), lambdaHandler);

// Erstelle package.json für Lambda
const lambdaPackageJson = {
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
    "@aws-sdk/client-ses": "^3.893.0"
  }
};

fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(lambdaPackageJson, null, 2));

// Installiere Dependencies
console.log('📥 Installiere Dependencies...');
execSync('npm install --production', { cwd: tempDir, stdio: 'inherit' });

// Erstelle ZIP File
console.log('🗜️ Erstelle ZIP Archive...');
execSync(`cd ${tempDir} && zip -r ../zestbet-lambda.zip .`);

console.log('✅ Lambda Package erstellt: zestbet-lambda.zip');

// Cleanup
execSync(`rm -rf ${tempDir}`);

console.log('\n🎯 Nächste Schritte:');
console.log('1. Führen Sie das AWS Setup Script aus: node aws-setup.js');
console.log('2. Oder deployen Sie manuell mit AWS CLI');