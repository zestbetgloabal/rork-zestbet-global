# 🧪 ZestBet Testing Guide

## Quick Start Testing

### 1. Run API Status Check
```bash
chmod +x test-api-status.sh
./test-api-status.sh
```

### 2. Run Quick Test
```bash
chmod +x quick-test.sh
./quick-test.sh
```

### 3. Run Complete Test Suite
```bash
chmod +x test-complete-app.sh
./test-complete-app.sh
```

## What Each Test Does

### API Status Test (`test-api-status.sh`)
- ✅ Checks if main app is loading
- ✅ Checks if API endpoints are working
- ✅ Tests tRPC hello endpoint
- ✅ Tests login functionality
- 🔍 Detects if API is serving HTML instead of JSON (deployment issue)

### Quick Test (`quick-test.sh`)
- ✅ Basic API health check
- ✅ tRPC hello endpoint
- ✅ User login test
- ⚡ Fast execution (30 seconds)

### Complete Test Suite (`test-complete-app.sh`)
- 🔧 Infrastructure tests (API, CORS, health)
- 👤 Authentication tests (register, login, admin)
- 💰 Core features (wallet, bets, challenges, live events)
- 📱 Frontend tests (app loading, assets)
- 🔒 Security tests (rate limiting, SQL injection)
- 📊 Performance tests (response time)
- 📧 Email system tests
- ⏱️ Complete execution (2-3 minutes)

## Expected Results

### ✅ Success Indicators
- HTTP 200 responses
- JSON responses from API endpoints
- User login returns token/user data
- All tests pass with green checkmarks

### ❌ Failure Indicators
- HTML responses from API endpoints (means deployment issue)
- HTTP 404/500 errors
- "Unexpected token '<'" errors
- Failed authentication

## Test Accounts Available

- **Regular User**: `test@example.com` / `password123`
- **Admin User**: `admin@zestbet.com` / `admin2025!`
- **Apple Review**: `pinkpistachio72@gmail.com` / `zestapp2025#`

## Troubleshooting

### If API Returns HTML Instead of JSON
1. The API routes are not properly deployed to Vercel
2. Need to redeploy the application
3. Check Vercel deployment logs

### If Tests Fail
1. Check internet connection
2. Verify Vercel deployment is active
3. Check database connection (Supabase)
4. Review error messages in test output

### If Mobile App Doesn't Work
1. Test web version first: https://rork-zestbet-global.vercel.app
2. Check QR code generation
3. Verify Expo Go compatibility

## Manual Testing Steps

### 1. Web App Testing
1. Open: https://rork-zestbet-global.vercel.app
2. Try to register a new account
3. Login with test account
4. Navigate through tabs (Bets, Challenges, Live, etc.)
5. Test wallet functionality
6. Create a bet or challenge

### 2. Mobile App Testing
1. Open Expo Go app on phone
2. Scan QR code from web interface
3. Test all functionality on mobile
4. Check push notifications
5. Test camera features (if any)

### 3. API Testing
1. Use Postman or curl to test endpoints
2. Test authentication flow
3. Verify database operations
4. Check email sending

## Performance Benchmarks

- API response time: < 2 seconds
- App loading time: < 5 seconds
- Database queries: < 1 second
- Email delivery: < 30 seconds

## Next Steps After Testing

1. ✅ All tests pass → App is production ready
2. ⚠️ Some tests fail → Fix issues and retest
3. 📱 Test mobile functionality
4. 🚀 Submit to app stores (if needed)
5. 📊 Monitor production metrics