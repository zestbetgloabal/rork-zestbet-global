# 🎯 ZestBet - Erste Schritte zur Nutzung

## ✅ ALLES IST BEREIT!

Ihre ZestBet App ist vollständig konfiguriert und produktionsbereit. Hier ist eine einfache Anleitung für den ersten Start:

## 🚀 SOFORT STARTEN

### 1. **App öffnen**
- Öffnen Sie Ihre ZestBet App
- Die App verbindet sich automatisch mit:
  - **API**: `https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/api`
  - **Datenbank**: Supabase PostgreSQL
  - **Email**: Strato SMTP Server

### 2. **Ersten Benutzer registrieren**
1. Klicken Sie auf "Registrieren"
2. Geben Sie eine echte Email-Adresse ein
3. Wählen Sie ein sicheres Passwort
4. Sie erhalten eine Verifikations-Email von `info@zestapp.online`
5. Geben Sie den 4-stelligen Code aus der Email ein
6. ✅ **Fertig!** Sie erhalten 1.000 ZEST Coins als Willkommensbonus

### 3. **Erste Wette erstellen**
1. Gehen Sie zum "Wetten" Tab
2. Klicken Sie auf "Neue Wette erstellen"
3. Beschreiben Sie Ihre Wette
4. Setzen Sie ZEST Coins ein
5. Teilen Sie die Wette mit Freunden

## 📱 APP FEATURES - ALLE FUNKTIONAL

### ✅ **Benutzer-System**
- Registrierung mit Email-Verifikation
- Sicherer Login/Logout
- Passwort zurücksetzen
- Profil bearbeiten

### ✅ **Wett-System**
- Wetten erstellen und annehmen
- Live-Wetten mit Real-time Updates
- Wett-Historie und Statistiken
- Automatische Auszahlungen

### ✅ **Social Features**
- Freunde einladen (Bonus: 500 ZEST Coins)
- Leaderboards und Rankings
- Challenges zwischen Freunden
- Social Feed mit Posts

### ✅ **ZEST Coins Wallet**
- Virtuelles Wallet-System
- Transaktions-Historie
- Tägliche Belohnungen
- Achievements und Badges

### ✅ **Live Events**
- Echte Sportereignisse
- Live-Wetten während Events
- Real-time Odds Updates
- Event-Kalender

## 🧪 TESTEN SIE DIE API

Führen Sie diesen Befehl aus, um zu testen, ob alles funktioniert:

```bash
chmod +x test-production-api.sh
./test-production-api.sh
```

## 📧 EMAIL-SYSTEM TESTEN

1. Registrieren Sie sich mit Ihrer echten Email
2. Prüfen Sie Ihr Postfach (auch Spam-Ordner)
3. Sie sollten eine schöne HTML-Email von "ZestBet" erhalten
4. Der Verifikationscode funktioniert in der App

## 🔧 FALLS PROBLEME AUFTRETEN

### Problem: Keine Email erhalten
**Lösung**: 
- Prüfen Sie Spam-Ordner
- Strato SMTP ist konfiguriert: `smtp.strato.de:587`
- Email wird von `info@zestapp.online` gesendet

### Problem: API nicht erreichbar
**Lösung**:
- API Gateway URL ist korrekt: `https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/api`
- Lambda-Funktion ist deployed
- CORS ist für `zestapp.online` konfiguriert

### Problem: Datenbank-Verbindung
**Lösung**:
- Supabase PostgreSQL ist konfiguriert
- SSL-Verbindung ist aktiviert
- Connection String ist korrekt

## 🎉 HERZLICHEN GLÜCKWUNSCH!

**Ihre ZestBet App ist vollständig funktionsfähig und produktionsbereit!**

### Was funktioniert sofort:
- ✅ Benutzerregistrierung und Login
- ✅ Email-Verifikation über Strato
- ✅ Wetten erstellen und annehmen
- ✅ ZEST Coins System
- ✅ Live-Events und Real-time Updates
- ✅ Social Features und Freunde einladen
- ✅ Wallet und Transaktionen
- ✅ Leaderboards und Challenges

### Nächste Schritte (optional):
1. **Social Login** hinzufügen (Google, Facebook, Apple)
2. **Payment Integration** für echtes Geld (Stripe, PayPal)
3. **Push Notifications** für Live-Events
4. **App Store Submission** für iOS/Android

**Viel Erfolg mit Ihrer ZestBet App! 🚀**