# Backend Connection Fix

## Das Problem

Die tRPC-Verbindung schlägt fehl mit dem Fehler:
```
❌ tRPC fetch error: TypeError: Failed to fetch
❌ Challenges query error: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## Die Ursache

Der Fehler "Unexpected token '<', \"<!DOCTYPE\"..." bedeutet, dass der tRPC-Client eine HTML-Seite (wahrscheinlich eine 404-Seite) statt JSON bekommt. Das passiert, wenn:

1. Das Backend nicht läuft
2. Das Backend auf der falschen URL läuft
3. Die tRPC-Endpunkte nicht korrekt konfiguriert sind

## Die Lösung

### Schnelle Lösung (Empfohlen)

1. Öffne ein neues Terminal
2. Führe aus: `./fix-backend-now.sh`
3. Warte auf "✅ Backend is working!" Nachricht
4. Lass das Terminal offen
5. Die App sollte jetzt funktionieren

### Alternative Lösungen

#### Option 1: Einfacher Dev-Server
```bash
bun run dev-server.ts
```

#### Option 2: Vollständiger Backend-Server
```bash
./start-backend.sh
```

#### Option 3: Manuell
```bash
# Port 3001 freigeben
lsof -ti:3001 | xargs kill -9

# Backend starten
bun run backend/server.ts
```

## Diagnose

Besuche in der App: `/backend-diagnostic` um den Status zu überprüfen.

Die Diagnose-Seite zeigt:
- ✅ Environment-Variablen
- ✅ API-Endpunkt-Tests
- ✅ tRPC-Verbindungstests
- ✅ Beispiel-Queries

## Warum passiert das?

1. **Backend läuft nicht**: Der häufigste Grund
2. **Port-Konflikt**: Ein anderer Prozess blockiert Port 3001
3. **Falsche URL**: tRPC-Client zeigt auf falsche URL
4. **CORS-Probleme**: Backend blockiert Frontend-Requests

## Environment-Variablen

Die `.env` Datei ist korrekt konfiguriert:
```
EXPO_PUBLIC_TRPC_URL=http://localhost:3001/api/trpc
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_BASE_URL=http://localhost:3001
```

## Debugging

### 1. Backend-Status prüfen
```bash
curl http://localhost:3001/api/status
```

### 2. tRPC-Endpunkt testen
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"path":"example.hi","input":{"name":"test"}}' \
  http://localhost:3001/api/trpc
```

### 3. Port-Nutzung prüfen
```bash
lsof -i :3001
```

## Häufige Fehler

1. **"Failed to fetch"** = Backend läuft nicht
2. **"<!DOCTYPE..."** = HTML statt JSON (404-Seite)
3. **"Connection refused"** = Port blockiert oder Backend down
4. **"CORS error"** = CORS-Konfiguration falsch

## Permanente Lösung

Das Backend muss immer laufen, wenn die App verwendet wird. Am besten:

1. Ein Terminal für das Backend: `./fix-backend-now.sh`
2. Ein Terminal für die App: `bun start`
3. Beide Terminals offen lassen während der Entwicklung

## Weitere Hilfe

- Diagnose-Seite: `/backend-diagnostic`
- Backend-Logs im Terminal beachten
- Bei Problemen: Backend neu starten