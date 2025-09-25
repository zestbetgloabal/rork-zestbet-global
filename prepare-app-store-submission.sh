#!/bin/bash

# App Store Submission Preparation Script
# ZestBet Global v1.1.0

echo "🚀 ZestBet Global - App Store Submission Vorbereitung"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    echo "❌ Fehler: app.json nicht gefunden. Bist du im richtigen Verzeichnis?"
    exit 1
fi

echo "📋 Schritt 1: Version prüfen..."
CURRENT_VERSION=$(grep '"version"' app.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
echo "Aktuelle Version: $CURRENT_VERSION"

if [ "$CURRENT_VERSION" != "1.1.0" ]; then
    echo "⚠️  Version muss auf 1.1.0 erhöht werden!"
    echo "Bitte ändere in app.json und package.json die Version von $CURRENT_VERSION zu 1.1.0"
    echo ""
    echo "In app.json:"
    echo '  "version": "1.1.0",'
    echo ""
    echo "In package.json:"
    echo '  "version": "1.1.0",'
    echo ""
    read -p "Drücke Enter wenn du die Versionen geändert hast..."
fi

echo "📦 Schritt 2: Dependencies prüfen..."
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi

echo "🧪 Schritt 3: TypeScript prüfen..."
if command -v tsc &> /dev/null; then
    npx tsc --noEmit
    if [ $? -eq 0 ]; then
        echo "✅ TypeScript OK"
    else
        echo "❌ TypeScript Fehler gefunden!"
        exit 1
    fi
else
    echo "⚠️  TypeScript nicht installiert, überspringe Check"
fi

echo "🔍 Schritt 4: Crash Prevention Status..."
if [ -f "utils/crashPrevention.ts" ] && [ -f "utils/stringSafety.ts" ]; then
    echo "✅ Crash Prevention System: Installiert"
    echo "✅ String Safety System: Installiert"
    
    # Check if crash prevention is initialized in _layout.tsx
    if grep -q "initializeCrashPrevention" app/_layout.tsx; then
        echo "✅ Crash Prevention: Initialisiert in _layout.tsx"
    else
        echo "❌ Crash Prevention nicht in _layout.tsx initialisiert!"
        exit 1
    fi
else
    echo "❌ Crash Prevention Dateien fehlen!"
    exit 1
fi

echo "📱 Schritt 5: Test Empfehlungen..."
echo "Bitte teste folgende Features vor dem Build:"
echo "  - App startet ohne Crash"
echo "  - Login/Logout funktioniert"
echo "  - Navigation zwischen allen Tabs"
echo "  - Live-Events laden korrekt"
echo "  - E-Mail Validierung funktioniert"
echo "  - Alle Screens öffnen sich ohne Fehler"
echo ""

read -p "Hast du alle Features getestet? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Bitte teste die App zuerst mit: expo start"
    exit 1
fi

echo "🏗️  Schritt 6: Build Kommandos..."
echo "Führe diese Kommandos aus um den Build zu erstellen:"
echo ""
echo "# EAS CLI installieren (falls nicht installiert):"
echo "npm install -g @expo/eas-cli"
echo ""
echo "# Bei EAS anmelden:"
echo "eas login"
echo ""
echo "# iOS Build für Production:"
echo "eas build --platform ios --profile production"
echo ""
echo "# Build Status checken:"
echo "eas build:list"
echo ""
echo "# Build herunterladen (wenn fertig):"
echo "eas build:download --platform ios"
echo ""

echo "📝 Schritt 7: App Store Connect..."
echo "Nach dem Build:"
echo "1. Gehe zu https://appstoreconnect.apple.com"
echo "2. Wähle 'ZestBet Global'"
echo "3. Erstelle neue Version '1.1.0'"
echo "4. Lade die .ipa Datei hoch"
echo "5. Fülle Release Notes aus:"
echo ""
echo "   Version 1.1.0 Release Notes:"
echo "   - Fixed app crashes on iPad devices"
echo "   - Improved app stability and performance"
echo "   - Enhanced memory management"
echo "   - Better error handling"
echo "   - Optimized for iPadOS 26.0"
echo ""

echo "✅ Vorbereitung abgeschlossen!"
echo "Die App ist bereit für die App Store Einreichung."
echo ""
echo "📋 Nächste Schritte:"
echo "1. Versionen in app.json und package.json auf 1.1.0 setzen"
echo "2. eas build --platform ios --profile production"
echo "3. Build bei App Store Connect hochladen"
echo ""
echo "🆘 Bei Problemen: Kontaktiere mich für weitere Hilfe"