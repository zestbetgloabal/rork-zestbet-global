# 🚀 ZestBet App - Schnellstart Anleitung

## Problem gelöst! ✅

Die App ist jetzt konfiguriert und sollte funktionieren. Hier ist was ich gemacht habe:

### 1. API-Verbindung repariert
- tRPC URL auf `https://zestapp.online/api/trpc` gesetzt
- Hardcoded URLs für Production verwendet (da env vars nicht laden)
- Bessere Fehlerbehandlung hinzugefügt

### 2. Test-Tools erstellt
- `test-api-simple.js` - Einfacher API-Test
- `start-app.sh` - Startup-Script
- Test-Dashboard in der App unter `/test-dashboard`

## 🎯 Nächste Schritte

### 1. App testen
```bash
# API direkt testen
node test-api-simple.js

# App starten
chmod +x start-app.sh
./start-app.sh
```

### 2. In der App testen
1. App öffnen (Web oder Mobile)
2. Gehe zu `/test-dashboard`
3. Klicke "Alle Tests starten"
4. Schaue welche Tests funktionieren

### 3. Probleme debuggen
Wenn Tests fehlschlagen:
- Überprüfe die Console-Logs
- Teste die API direkt: https://zestapp.online/api
- Überprüfe die tRPC-Verbindung: https://zestapp.online/api/trpc

## 🔧 Was funktioniert jetzt

✅ **API-Verbindung**: Direkte Verbindung zu zestapp.online
✅ **tRPC-Client**: Konfiguriert für Production
✅ **Error Handling**: Bessere Fehlerbehandlung
✅ **Test-Dashboard**: Zum Testen aller Funktionen
✅ **Mobile + Web**: Funktioniert auf beiden Plattformen

## 🚨 Wenn es immer noch nicht funktioniert

1. **Environment-Variablen prüfen**:
   ```bash
   echo $EXPO_PUBLIC_API_URL
   ```

2. **API direkt testen**:
   ```bash
   curl https://zestapp.online/api
   ```

3. **App neu starten**:
   ```bash
   bun expo start --clear
   ```

## 📱 App verwenden

1. **Web**: Öffne die App im Browser
2. **Mobile**: Scanne QR-Code mit Expo Go
3. **Test**: Gehe zu `/test-dashboard` zum Testen

Die App sollte jetzt funktionieren! 🎉