#!/bin/bash

echo "🚀 Deploying ZestBet to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Link to Railway project (if not already linked)
echo "🔗 Linking to Railway project..."
railway link

# Set environment variables
echo "🔧 Setting environment variables..."

# Database
railway variables set DATABASE_URL="postgresql://postgres.iwdfgtdfzjsgcnttkaob:Fruchtgummi2025##@aws-1-eu-central-1.pooler.supabase.com:6543/postgres"

# JWT
railway variables set JWT_SECRET="a8f5f167f44f4964e6c998dee827110c"
railway variables set JWT_EXPIRES_IN="7d"

# Email
railway variables set EMAIL_FROM="zestbetglobal@gmail.com"
railway variables set EMAIL_FROM_NAME="ZestBet"
railway variables set SMTP_HOST="smtp.gmail.com"
railway variables set SMTP_PORT="587"
railway variables set SMTP_SECURE="false"
railway variables set SMTP_USER="zestbetglobal@gmail.com"
railway variables set SMTP_PASS="mbdtvyrwhqdvqxf"

# Node environment
railway variables set NODE_ENV="production"
railway variables set PORT="3001"

# Get Railway URL
echo "📡 Getting Railway deployment URL..."
RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].url' 2>/dev/null || echo "")

if [ -z "$RAILWAY_URL" ]; then
    echo "⚠️  Could not get Railway URL automatically. You'll need to update the URLs manually after deployment."
    RAILWAY_URL="https://your-railway-app.railway.app"
fi

echo "🌐 Railway URL: $RAILWAY_URL"

# Update CORS origin
railway variables set CORS_ORIGIN="https://zestapp.online,https://main.ddk0z2esbs19wf.amplifyapp.com,$RAILWAY_URL,http://localhost:3000,http://localhost:8081"

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🔗 Your API is available at: $RAILWAY_URL"
echo "🔗 Health check: $RAILWAY_URL/api/health"
echo "🔗 tRPC endpoint: $RAILWAY_URL/api/trpc"

echo ""
echo "📝 Next steps:"
echo "1. Update your .env file with the Railway URL:"
echo "   EXPO_PUBLIC_BASE_URL=$RAILWAY_URL"
echo "   EXPO_PUBLIC_API_URL=$RAILWAY_URL/api"
echo "   EXPO_PUBLIC_TRPC_URL=$RAILWAY_URL/api/trpc"
echo ""
echo "2. Test your API:"
echo "   curl $RAILWAY_URL/api/health"
echo ""
echo "3. Update your frontend to use the new URLs"