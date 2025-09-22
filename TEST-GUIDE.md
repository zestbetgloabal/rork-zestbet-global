# 🧪 ZestBet Test Guide

Umfassende Anleitung zum Testen deiner ZestBet App

## 📋 Übersicht

Nach dem erfolgreichen Production Setup kannst du deine App jetzt systematisch testen. Hier sind alle verfügbaren Test-Tools und -methoden:

## 🛠️ Test-Tools

### 1. Automatisierte Test-Suite (Bash)
```bash
# Vollständige App-Tests
chmod +x test-complete-app.sh
./test-complete-app.sh
```

**Was wird getestet:**
- ✅ API Health Check
- ✅ tRPC Endpunkte
- ✅ CORS Headers
- ✅ Authentifizierung
- ✅ Datenbank-Verbindung
- ✅ Core Features (Wallet, Bets, etc.)
- ✅ Security (Rate Limiting, SQL Injection)
- ✅ Performance (Response Time)
- ✅ Email System

### 2. Mobile Test-Suite (Node.js)
```bash
# Mobile-spezifische Tests
node test-mobile-app.js
```

**Was wird getestet:**
- 📱 Mobile Kompatibilität
- 📱 Responsive Design
- 📱 Touch-Interaktionen
- 📱 Performance auf mobilen Geräten

### 3. Interaktives Test-Dashboard (React Native)
Öffne die App und navigiere zu `/test-dashboard`

**Features:**
- 🎯 Live-Tests in der App
- 📊 Visueller Test-Status
- ⚡ Echte API-Calls
- 📈 Performance-Metriken

## 🔗 Test-URLs

### Haupt-App
- **Web App:** https://rork-zestbet-global.vercel.app
- **API:** https://rork-zestbet-global.vercel.app/api
- **tRPC:** https://rork-zestbet-global.vercel.app/api/trpc

### Test-Endpunkte
- **Health Check:** https://rork-zestbet-global.vercel.app/api/
- **Hello Test:** https://rork-zestbet-global.vercel.app/api/trpc/example.hi

## 👥 Test-Accounts

### Standard User
- **Email:** test@example.com
- **Password:** password123

### Admin User
- **Email:** admin@zestbet.com
- **Password:** admin2025!

### Apple Review Account
- **Email:** pinkpistachio72@gmail.com
- **Password:** zestapp2025#

## 📱 Mobile Testing

### 1. QR Code Test
1. Öffne https://rork-zestbet-global.vercel.app
2. Scanne den QR Code mit deinem Handy
3. Teste alle Funktionen auf dem mobilen Gerät

### 2. Browser Test
1. Öffne die App in verschiedenen mobilen Browsern:
   - Safari (iOS)
   - Chrome (Android)
   - Firefox Mobile
   - Samsung Internet

### 3. Responsive Design Test
Teste verschiedene Bildschirmgrößen:
- iPhone SE (375x667)
- iPhone 12 (390x844)
- iPhone 12 Pro Max (428x926)
- Samsung Galaxy S21 (360x800)
- iPad (768x1024)

## 🧪 Manuelle Test-Checkliste

### Authentifizierung
- [ ] Registrierung mit neuer Email
- [ ] Login mit existierendem Account
- [ ] Logout funktioniert
- [ ] Passwort vergessen
- [ ] Email-Verifizierung

### Core Features
- [ ] Wallet Balance anzeigen
- [ ] Bets erstellen und anzeigen
- [ ] Challenges erstellen und teilnehmen
- [ ] Live Events anzeigen
- [ ] Profil bearbeiten

### Navigation
- [ ] Tab-Navigation funktioniert
- [ ] Stack-Navigation (zurück-Button)
- [ ] Deep Links
- [ ] Modal-Screens

### Performance
- [ ] App lädt schnell (< 3 Sekunden)
- [ ] Smooth Scrolling
- [ ] Keine Memory Leaks
- [ ] Offline-Verhalten

### UI/UX
- [ ] Alle Buttons funktionieren
- [ ] Loading States
- [ ] Error States
- [ ] Empty States
- [ ] Dark/Light Mode (falls implementiert)

## 🔍 Debugging

### Browser DevTools
1. Öffne F12 in Chrome/Safari
2. Gehe zu Network Tab
3. Teste API Calls
4. Prüfe Console für Errors

### React Native Debugger
1. Installiere React Native Debugger
2. Verbinde mit der App
3. Prüfe Redux State (falls verwendet)
4. Analysiere Performance

### Logs
```bash
# API Logs (Vercel)
vercel logs

# Database Logs (Supabase)
# Gehe zu Supabase Dashboard > Logs

# Email Logs (Strato)
# Prüfe Strato Email-Einstellungen
```

## 🚨 Häufige Probleme

### API Errors
```bash
# Teste API Verbindung
curl https://rork-zestbet-global.vercel.app/api/

# Teste tRPC
curl -X POST https://rork-zestbet-global.vercel.app/api/trpc/example.hi \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Database Issues
```bash
# Teste Database Connection
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'YOUR_DATABASE_URL' });
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? err : res.rows[0]);
  pool.end();
});
"
```

### Email Problems
1. Prüfe SMTP-Einstellungen in Strato
2. Teste Email-Versand manuell
3. Prüfe Spam-Ordner

## 📊 Performance Monitoring

### Metriken zu überwachen:
- **Response Time:** < 2000ms
- **Error Rate:** < 1%
- **Uptime:** > 99.9%
- **Memory Usage:** Stabil
- **Database Queries:** Optimiert

### Tools:
- Vercel Analytics
- Supabase Monitoring
- Browser Performance Tab
- Lighthouse Audit

## 🎯 Test-Strategien

### 1. Smoke Tests (Täglich)
```bash
./test-complete-app.sh
```

### 2. Regression Tests (Vor Releases)
- Alle manuellen Tests durchführen
- Performance-Tests
- Cross-Browser Tests

### 3. User Acceptance Tests
- Echte User testen lassen
- Feedback sammeln
- Bugs dokumentieren

## 📝 Test-Dokumentation

### Bug Reports
```markdown
**Bug:** Beschreibung
**Steps:** 1. Schritt 1, 2. Schritt 2
**Expected:** Was erwartet wurde
**Actual:** Was passiert ist
**Browser:** Chrome 91
**Device:** iPhone 12
**Screenshot:** [Link]
```

### Test Results
- Dokumentiere alle Test-Ergebnisse
- Speichere Screenshots
- Notiere Performance-Metriken

## 🚀 Nächste Schritte

1. **Führe alle automatisierten Tests aus**
2. **Teste manuell auf verschiedenen Geräten**
3. **Dokumentiere gefundene Issues**
4. **Optimiere Performance**
5. **Bereite App Store Submission vor**

## 📞 Support

Bei Problemen:
1. Prüfe diese Anleitung
2. Führe Debug-Steps aus
3. Dokumentiere das Problem
4. Kontaktiere Support mit Details

---

**Happy Testing! 🎉**

Deine ZestBet App ist bereit für umfassende Tests. Nutze alle verfügbaren Tools und teste gründlich vor dem Launch!