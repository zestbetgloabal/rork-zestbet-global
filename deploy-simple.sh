#!/bin/bash

# ZestBet Deployment Script - Einfache Version
echo "🚀 ZestBet Deployment wird gestartet..."

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️ $1${NC}"; }

# Prüfe ob .env existiert
if [ ! -f ".env" ]; then
    error ".env Datei nicht gefunden!"
    exit 1
fi

# Lade Umgebungsvariablen
source .env

# Prüfe wichtige Variablen
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL ist nicht gesetzt!"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    error "JWT_SECRET ist nicht gesetzt!"
    exit 1
fi

success "Umgebungsvariablen geladen"

echo ""
info "📦 Installiere Dependencies..."
npm install

echo ""
info "🗄️ Führe Datenbankmigrationen aus..."
node backend/database/migrate.js

if [ $? -ne 0 ]; then
    error "Datenbankmigrationen fehlgeschlagen!"
    exit 1
fi

echo ""
info "🧪 Teste API Endpoints..."
node test-api.js

echo ""
info "🏗️ Baue Expo Web Version..."
npx expo export --platform web

echo ""
success "🎉 Deployment erfolgreich abgeschlossen!"
echo ""
echo "📱 Nächste Schritte:"
echo "1. Starte die App: npm start"
echo "2. Für Web: npm run start-web"
echo "3. Teste die API: node test-api.js"
echo ""
echo "🌐 API Endpoints:"
echo "- Lambda API: https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default"
echo "- tRPC: https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/trpc"