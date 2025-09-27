#!/bin/bash

echo "🍎 Configuring iOS Build Credentials for ZestBet Global"
echo "=================================================="

# Apple credentials from your information
APPLE_TEAM_ID="RLFRGC9727"
APPLE_ID="erhan.berse@googlemail.com"
ASC_APP_ID="6749276092"

echo "✅ Apple Team ID: $APPLE_TEAM_ID"
echo "✅ Apple ID: $APPLE_ID"
echo "✅ App Store Connect App ID: $ASC_APP_ID"
echo ""

echo "📝 Updating eas.json with build credentials..."

# Create a temporary eas.json with the correct build configuration
cat > eas.json << EOF
{
"cli": {
"version": ">= 12.0.0",
"appVersionSource": "local"
},
"build": {
"development": {
  "developmentClient": true,
  "distribution": "internal"
},
"preview": {
  "distribution": "internal",
  "ios": {
    "resourceClass": "m-medium",
    "appleTeamId": "$APPLE_TEAM_ID"
  },
  "android": {
    "resourceClass": "medium"
  }
},
"production": {
  "env": {
    "EXPO_PUBLIC_API_URL": "https://rork-zestbet-global.vercel.app/api",
    "EXPO_PUBLIC_TRPC_URL": "https://rork-zestbet-global.vercel.app/api/trpc",
    "EXPO_PUBLIC_BASE_URL": "https://zestapp.online"
  },
  "ios": {
    "resourceClass": "m-medium",
    "buildConfiguration": "Release",
    "appleTeamId": "$APPLE_TEAM_ID"
  },
  "android": {
    "resourceClass": "medium",
    "buildType": "app-bundle"
  }
}
},
"submit": {
"production": {
  "ios": {
    "appleId": "$APPLE_ID",
    "ascAppId": "$ASC_APP_ID",
    "appleTeamId": "$APPLE_TEAM_ID"
  }
}
}
}
EOF

echo "✅ eas.json updated with Apple Team ID in build configurations"
echo ""

echo "🔧 Now you can run the following commands:"
echo ""
echo "1. For preview build:"
echo "   eas build --platform ios --profile preview"
echo ""
echo "2. For production build:"
echo "   eas build --platform ios --profile production"
echo ""
echo "3. For automatic credential management:"
echo "   eas credentials"
echo ""

echo "📱 Your iOS build should now work with the configured credentials!"
echo "=================================================="