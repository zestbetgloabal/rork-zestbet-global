#!/bin/bash

# ZestBet Setup Script - Einfache Version
echo "🚀 ZestBet Setup wird gestartet..."

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funktion für Erfolg
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Funktion für Warnung
warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Funktion für Fehler
error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "📋 Überprüfe Umgebung..."

# Node.js Version prüfen
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js gefunden: $NODE_VERSION"
else
    error "Node.js ist nicht installiert!"
    exit 1
fi

# NPM Version prüfen
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    success "NPM gefunden: $NPM_VERSION"
else
    error "NPM ist nicht installiert!"
    exit 1
fi

# .env Datei prüfen
if [ -f ".env" ]; then
    success ".env Datei gefunden"
    
    # DATABASE_URL prüfen
    if grep -q "DATABASE_URL=" .env; then
        success "DATABASE_URL ist in .env konfiguriert"
    else
        warning "DATABASE_URL fehlt in .env"
    fi
else
    warning ".env Datei nicht gefunden"
    echo "Erstelle .env aus .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        success ".env Datei erstellt"
    else
        error ".env.example nicht gefunden!"
    fi
fi

echo ""
echo "🔧 Installiere Dependencies..."
npm install

echo ""
echo "🗄️ Teste Datenbankverbindung..."
node backend/database/migrate.js

echo ""
echo "🧪 Teste API Endpoints..."
node test-api.js

echo ""
echo "🎉 Setup abgeschlossen!"
echo ""
echo "📱 Starte die App mit:"
echo "   npm start"
echo ""
echo "🌐 Oder für Web:"
echo "   npm run start-web"