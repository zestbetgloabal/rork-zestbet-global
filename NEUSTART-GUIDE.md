# ZestBet - Einfacher Neustart Guide

## 🚀 Schnellstart

### 1. Setup ausführen
```bash
chmod +x setup.sh
./setup.sh
```

### 2. App starten
```bash
# Mobile App
npm start

# Web Version
npm run start-web
```

## 🛠️ Verfügbare Scripts

### Database Management
```bash
# Datenbank migrieren
node backend/database/migrate.js

# Datenbank zurücksetzen (ACHTUNG: Löscht alle Daten!)
node backend/database/reset.js
```

### Testing
```bash
# API testen
node test-api.js
```

### Deployment
```bash
# Einfaches Deployment
chmod +x deploy-simple.sh
./deploy-simple.sh
```

## 🔧 Manuelle Schritte

### 1. Dependencies installieren
```bash
npm install
```

### 2. Umgebung konfigurieren
- Kopiere `.env.example` zu `.env`
- Setze `DATABASE_URL` auf deine PostgreSQL Datenbank
- Setze `JWT_SECRET` auf einen sicheren Wert

### 3. Datenbank einrichten
```bash
node backend/database/migrate.js
```

### 4. API testen
```bash
node test-api.js
```

## 📱 App Struktur

```
├── app/                 # Expo Router Pages
├── components/          # React Components
├── backend/            # Backend Logic
│   ├── database/       # Database Scripts
│   ├── trpc/          # tRPC Routes
│   └── services/      # Services
├── lib/               # Utilities
└── types/             # TypeScript Types
```

## 🌐 API Endpoints

- **Lambda API**: `https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default`
- **tRPC**: `https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/trpc`

## 🗄️ Datenbank

Die App nutzt PostgreSQL (Supabase) mit folgenden Tabellen:
- `users` - Benutzer
- `bets` - Wetten
- `challenges` - Herausforderungen
- `transactions` - Transaktionen
- `live_events` - Live Events
- `live_bet_markets` - Live Wett-Märkte
- `live_bet_wagers` - Live Wetten
- `social_posts` - Social Posts

## 🚨 Troubleshooting

### Migration Fehler
```bash
# Datenbank zurücksetzen
node backend/database/reset.js

# Neu migrieren
node backend/database/migrate.js
```

### API Fehler
```bash
# API testen
node test-api.js
```

### Umgebungsvariablen
Stelle sicher, dass `.env` alle erforderlichen Variablen enthält:
- `DATABASE_URL`
- `JWT_SECRET`
- `SMTP_*` (für E-Mails)

## 📞 Support

Bei Problemen:
1. Prüfe die `.env` Datei
2. Teste die Datenbankverbindung
3. Führe `node test-api.js` aus
4. Prüfe die Logs in der Konsole