# 🚀 ZestBet API Fix Guide

## Problem Diagnosis
You're getting "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" because:
- Your app is deployed on Vercel but configured for AWS Lambda
- Vercel is serving HTML instead of API responses
- Missing proper API route structure for Vercel

## ✅ Solution Applied

I've created the proper Vercel API structure:

### 1. Created `/api/index.ts`
- Proper Vercel API handler using Hono
- Correct CORS configuration
- All your tRPC routes mounted at `/api/trpc/*`

### 2. Created `vercel.json`
- Configures Vercel to handle API routes correctly
- Sets up proper rewrites and headers

### 3. Updated `.env`
- Changed from AWS Lambda URLs to Vercel URLs
- `EXPO_PUBLIC_API_URL=https://rork-zestbet-global.vercel.app/api`
- `EXPO_PUBLIC_TRPC_URL=https://rork-zestbet-global.vercel.app/api/trpc`

### 4. Created Test Scripts
- `debug-api.sh` - Diagnoses API issues
- `quick-test.sh` - Quick API functionality test
- Updated `test-complete-app.sh` - Full test suite

## 🔧 Next Steps

### 1. Deploy to Vercel
```bash
# If using Git (recommended)
git add .
git commit -m "Fix API routes for Vercel deployment"
git push

# Vercel will automatically redeploy
```

### 2. Test the Fix
```bash
# Make scripts executable
chmod +x debug-api.sh quick-test.sh test-complete-app.sh

# Run quick test
./quick-test.sh

# If that works, run full test suite
./test-complete-app.sh
```

### 3. Verify Mobile App
- Open your app: https://rork-zestbet-global.vercel.app
- Scan QR code to test on mobile
- Try user registration and login

## 🔍 Troubleshooting

### If you still get HTML responses:
1. Check Vercel deployment logs
2. Ensure `api/index.ts` and `vercel.json` are deployed
3. Verify environment variables in Vercel dashboard

### If database errors:
1. Check if DATABASE_URL is set in Vercel environment variables
2. Verify Supabase connection string is correct
3. Run database migration if needed

### If email errors:
1. Verify SMTP_PASS is set in Vercel environment variables
2. Test email configuration with Strato

## 📊 Expected Test Results

After the fix, you should see:
- ✅ API Health Check: HTTP 200 - JSON response
- ✅ tRPC Hello: HTTP 200 - JSON with "result" field
- ✅ User Login: HTTP 200 or proper error response

## 🔗 Important URLs

- **App**: https://rork-zestbet-global.vercel.app
- **API**: https://rork-zestbet-global.vercel.app/api
- **tRPC**: https://rork-zestbet-global.vercel.app/api/trpc
- **Vercel Dashboard**: https://vercel.com/dashboard

## 🎯 Success Indicators

You'll know it's working when:
1. `./quick-test.sh` shows all green checkmarks
2. Mobile app can register/login users
3. No more "<!DOCTYPE" errors in API responses
4. JSON responses from all API endpoints

The main issue was that your app was deployed on Vercel but configured for AWS Lambda. Now it's properly configured for Vercel deployment!