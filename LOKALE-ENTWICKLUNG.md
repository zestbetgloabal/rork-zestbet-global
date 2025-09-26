# 🚀 ZestBet Lokale Entwicklung

Das Problem war, dass Ihre App versucht hat, auf AWS Amplify zuzugreifen, aber das Backend dort nicht funktioniert. Jetzt haben wir eine lokale Entwicklungsumgebung eingerichtet.

## ✅ Was wurde behoben:

1. **Environment Variables**: `.env` wurde auf lokale URLs umgestellt
2. **Backend Scripts**: Einfache Startskripte erstellt
3. **Test Tools**: Backend-Tests hinzugefügt

## 🛠️ Schnellstart:

### Option 1: Automatisch (Empfohlen)
```bash
# Skripte ausführbar machen
chmod +x setup-dev.sh start-dev.sh
./setup-dev.sh

# Development Environment starten
./start-dev.sh
```

### Option 2: Manuell
```bash
# Terminal 1: Backend starten
node start-backend.js

# Terminal 2: App starten
expo start
```

### Option 3: Direkt mit Bun
```bash
# Terminal 1: Backend
bun run backend/hono.ts

# Terminal 2: App
expo start
```

## 🧪 Backend testen:

```bash
# Backend-Verbindung testen
node test-backend.js
```

## 📱 App verwenden:

1. Backend starten (siehe oben)
2. `expo start` in anderem Terminal
3. QR-Code scannen oder im Browser öffnen
4. Account erstellen sollte jetzt funktionieren!

## 🔗 URLs:

- **API**: http://localhost:3001/api
- **tRPC**: http://localhost:3001/api/trpc
- **Status**: http://localhost:3001/api/status

## ❗ Wichtig:

- Backend muss laufen, bevor Sie die App starten
- Beide Terminals offen lassen während der Entwicklung
- Bei Problemen: `node test-backend.js` ausführen