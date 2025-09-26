#!/bin/bash

echo "🚀 ZestBet App Startup Script"
echo "=============================="

# Schritt 1: API testen
echo ""
echo "1️⃣ Testing API Connection..."
node test-api-simple.js

# Schritt 2: Environment prüfen
echo ""
echo "2️⃣ Checking Environment Variables..."
echo "EXPO_PUBLIC_API_URL: $EXPO_PUBLIC_API_URL"
echo "EXPO_PUBLIC_TRPC_URL: $EXPO_PUBLIC_TRPC_URL"
echo "EXPO_PUBLIC_BASE_URL: $EXPO_PUBLIC_BASE_URL"

# Schritt 3: App starten
echo ""
echo "3️⃣ Starting the app..."
echo "You can now:"
echo "• Open the app in your browser"
echo "• Scan the QR code with Expo Go"
echo "• Go to /test-dashboard to run tests"
echo ""
echo "🔗 Important URLs:"
echo "• App: https://zestapp.online"
echo "• API: https://zestapp.online/api"
echo "• Test Dashboard: /test-dashboard"
echo ""

# App starten
bun expo start