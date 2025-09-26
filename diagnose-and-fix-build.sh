#!/bin/bash

echo "🔍 ZestBet Build Diagnose & Fix"
echo "==============================="

# Schritt 1: Systemdiagnose
echo "📊 Führe Systemdiagnose durch..."

echo "Node.js Version:"
node --version

echo "NPM Version:"
npm --version

echo "Expo CLI Version:"
npx expo --version

echo "EAS CLI Version:"
eas --version

# Schritt 2: Dateiberechtigungen prüfen
echo "🔐 Prüfe Dateiberechtigungen..."
ls -la app.json
ls -la package.json
ls -la eas.json

# Schritt 3: JSON Validierung
echo "✅ Validiere JSON Dateien..."

echo "Prüfe app.json..."
if node -e "JSON.parse(require('fs').readFileSync('app.json', 'utf8'))"; then
    echo "✅ app.json ist gültig"
else
    echo "❌ app.json hat Syntax-Fehler"
fi

echo "Prüfe package.json..."
if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"; then
    echo "✅ package.json ist gültig"
else
    echo "❌ package.json hat Syntax-Fehler"
fi

echo "Prüfe eas.json..."
if node -e "JSON.parse(require('fs').readFileSync('eas.json', 'utf8'))"; then
    echo "✅ eas.json ist gültig"
else
    echo "❌ eas.json hat Syntax-Fehler"
fi

# Schritt 4: EAS Login Status
echo "👤 Prüfe EAS Login..."
if eas whoami; then
    echo "✅ Bei EAS eingeloggt"
else
    echo "❌ Nicht bei EAS eingeloggt - führe 'eas login' aus"
fi

# Schritt 5: Projekt-Konfiguration prüfen
echo "🔧 Prüfe Projekt-Konfiguration..."
if [ -f "eas.json" ]; then
    echo "✅ eas.json vorhanden"
else
    echo "❌ eas.json fehlt"
fi

# Schritt 6: Dependencies prüfen
echo "📦 Prüfe Dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules vorhanden"
else
    echo "❌ node_modules fehlt - führe 'npm install' aus"
fi

# Schritt 7: Cache leeren und neu installieren
echo "🧹 Leere Caches und installiere neu..."
rm -rf node_modules
rm -rf .expo
rm -rf dist
rm -f package-lock.json

echo "📦 Installiere Dependencies..."
npm install

echo "🔄 Leere Expo Cache..."
npx expo install --fix
npx expo r -c

# Schritt 8: Build-Versuch
echo "🚀 Versuche Build zu starten..."
echo ""
echo "WICHTIG: Falls das Build fehlschlägt, liegt es an den schreibgeschützten Konfigurationsdateien."
echo "Du musst dann manuell folgende Schritte ausführen:"
echo ""
echo "1. Überprüfe die Dateiberechtigungen in deinem GitHub Repository"
echo "2. Stelle sicher, dass app.json und eas.json nicht schreibgeschützt sind"
echo "3. Führe 'eas build --platform all --profile production' manuell aus"
echo ""

# Versuche den Build
eas build --platform all --profile production

echo ""
echo "✅ Diagnose abgeschlossen!"
echo ""
echo "Falls der Build immer noch fehlschlägt:"
echo "1. Prüfe GitHub Repository-Einstellungen"
echo "2. Stelle sicher, dass keine Branch-Protection-Rules aktiv sind"
echo "3. Führe 'git status' aus um zu sehen ob Dateien geändert werden können"
echo "4. Kontaktiere den Support falls das Problem weiterhin besteht"