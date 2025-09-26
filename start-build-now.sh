#!/bin/bash

echo "🚀 ZestBet - Direkter Build Start"
echo "================================"

# Alle Scripts ausführbar machen
chmod +x *.sh

# Cache komplett leeren
echo "🧹 Leere alle Caches..."
rm -rf node_modules
rm -rf .expo
rm -rf dist
rm -rf .next
rm -f package-lock.json
rm -f yarn.lock

# Frische Installation
echo "📦 Frische Installation..."
npm install --force

# Expo Cache leeren
echo "🔄 Expo Cache leeren..."
npx expo r -c

# EAS CLI aktualisieren
echo "⬆️ EAS CLI aktualisieren..."
npm install -g @expo/eas-cli@latest

# Login prüfen
echo "👤 Login Status..."
eas whoami

# Build starten
echo "🚀 Build starten..."
echo ""
echo "Wähle Plattform:"
echo "1) iOS"
echo "2) Android" 
echo "3) Beide"
echo ""
read -p "Eingabe (1-3): " platform

case $platform in
    1)
        eas build --platform ios --profile production
        ;;
    2)
        eas build --platform android --profile production
        ;;
    3)
        eas build --platform all --profile production
        ;;
    *)
        echo "Starte Build für alle Plattformen..."
        eas build --platform all --profile production
        ;;
esac