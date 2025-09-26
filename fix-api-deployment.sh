#!/bin/bash

echo "🚀 ZestBet API Deployment Fix"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing dependencies..."
bun install

echo "🔧 Building project..."
bun run build 2>/dev/null || echo "⚠️  Build script not found, continuing..."

echo "🧪 Testing local API setup..."
node -e "
const fs = require('fs');
const path = require('path');

// Check if API files exist
const apiIndex = path.join(__dirname, 'api', 'index.ts');
const apiDiagnostic = path.join(__dirname, 'api', 'diagnostic.ts');

console.log('API Index exists:', fs.existsSync(apiIndex) ? '✅' : '❌');
console.log('API Diagnostic exists:', fs.existsSync(apiDiagnostic) ? '✅' : '❌');

// Check environment variables
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
    console.log('Environment file exists: ✅');
    const envContent = fs.readFileSync(envFile, 'utf8');
    const hasApiUrl = envContent.includes('EXPO_PUBLIC_API_URL');
    const hasTrpcUrl = envContent.includes('EXPO_PUBLIC_TRPC_URL');
    console.log('API URL configured:', hasApiUrl ? '✅' : '❌');
    console.log('tRPC URL configured:', hasTrpcUrl ? '✅' : '❌');
} else {
    console.log('Environment file exists: ❌');
}
"

echo ""
echo "🌐 Testing deployed API endpoints..."
echo "Testing: https://rork-zestbet-global.vercel.app/api/diagnostic"

# Test the diagnostic endpoint
curl -s -H "Accept: application/json" "https://rork-zestbet-global.vercel.app/api/diagnostic" | head -c 200
echo ""

echo ""
echo "📱 Next steps:"
echo "1. If the API test above shows HTML instead of JSON, your Vercel deployment needs to be redeployed"
echo "2. Check your Vercel dashboard for build errors"
echo "3. Make sure environment variables are set in Vercel"
echo "4. Try running: vercel --prod (if you have Vercel CLI installed)"
echo ""
echo "🔍 To debug further, check:"
echo "- Vercel dashboard: https://vercel.com/dashboard"
echo "- Build logs in Vercel"
echo "- Environment variables in Vercel project settings"