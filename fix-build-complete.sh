#!/bin/bash

echo "🔧 ZestBet Build Fix - Vollständige Reparatur"
echo "=============================================="

# Schritt 1: Berechtigungen setzen
echo "📁 Setze Dateiberechtigungen..."
chmod 755 .
chmod 644 app.json
chmod 644 package.json
chmod 644 tsconfig.json
chmod -R 755 app/
chmod -R 755 components/
chmod -R 755 assets/

# Schritt 2: Node Modules neu installieren
echo "📦 Installiere Dependencies neu..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f bun.lockb

# Verwende npm für saubere Installation
npm install

# Schritt 3: Expo Cache leeren
echo "🧹 Leere Expo Cache..."
npx expo install --fix
npx expo r -c

# Schritt 4: TypeScript Cache leeren
echo "🔄 Leere TypeScript Cache..."
rm -rf .expo/
rm -rf dist/
rm -rf .next/

# Schritt 5: Prüfe kritische Dateien
echo "🔍 Prüfe kritische Dateien..."

if [ ! -f "app.json" ]; then
    echo "❌ app.json fehlt!"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json fehlt!"
    exit 1
fi

# Schritt 6: Validiere JSON Syntax
echo "✅ Validiere JSON Dateien..."
node -e "JSON.parse(require('fs').readFileSync('app.json', 'utf8'))" || {
    echo "❌ app.json hat Syntax-Fehler!"
    exit 1
}

node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" || {
    echo "❌ package.json hat Syntax-Fehler!"
    exit 1
}

# Schritt 7: EAS CLI aktualisieren
echo "🔄 Aktualisiere EAS CLI..."
npm install -g @expo/eas-cli@latest

# Schritt 8: Expo CLI aktualisieren
echo "🔄 Aktualisiere Expo CLI..."
npm install -g @expo/cli@latest

# Schritt 9: Login Status prüfen
echo "👤 Prüfe EAS Login Status..."
eas whoami || {
    echo "⚠️  Du bist nicht bei EAS eingeloggt!"
    echo "Führe aus: eas login"
    exit 1
}

# Schritt 10: Build starten
echo "🚀 Starte Production Build..."
echo "Wähle eine Option:"
echo "1) iOS Build"
echo "2) Android Build"
echo "3) Beide Plattformen"

read -p "Deine Wahl (1-3): " choice

case $choice in
    1)
        echo "📱 Starte iOS Build..."
        eas build --platform ios --profile production
        ;;
    2)
        echo "🤖 Starte Android Build..."
        eas build --platform android --profile production
        ;;
    3)
        echo "📱🤖 Starte Build für beide Plattformen..."
        eas build --platform all --profile production
        ;;
    *)
        echo "❌ Ungültige Auswahl!"
        exit 1
        ;;
esac

echo "✅ Build-Fix abgeschlossen!"
echo "Der Build sollte jetzt erfolgreich starten."