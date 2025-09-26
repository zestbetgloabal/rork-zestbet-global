#!/bin/bash

echo "🔧 Schnelle Build-Reparatur für ZestBet"
echo "======================================"

# Berechtigungen korrigieren
chmod +x fix-build-complete.sh
chmod 644 app.json package.json tsconfig.json

# Cache leeren
echo "🧹 Leere alle Caches..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf dist

# Dependencies neu installieren
echo "📦 Installiere Dependencies..."
npm install --force

# Expo Cache leeren
echo "🔄 Leere Expo Cache..."
npx expo r -c

# EAS Build starten
echo "🚀 Starte EAS Build..."
echo "Führe aus: eas build --platform all --profile production"

eas build --platform all --profile production