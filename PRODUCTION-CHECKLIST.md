# ZestBet Production Deployment Checkliste

## ✅ Sofort erforderlich für Live-Betrieb:

### 1. Backend API URL konfigurieren
- [ ] **KRITISCH**: Echte API Gateway URL in `.env` eintragen
- [ ] Nach Lambda Deployment: `EXPO_PUBLIC_TRPC_URL` und `EXPO_PUBLIC_API_URL` aktualisieren
- [ ] Format: `https://YOUR_API_GATEWAY_ID.execute-api.eu-central-1.amazonaws.com/prod`

### 2. Datenbank Setup
- [ ] **KRITISCH**: PostgreSQL Datenbank erstellen (AWS RDS empfohlen)
- [ ] `DATABASE_URL` in `.env` mit echter Datenbank-URL ersetzen
- [ ] Datenbank-Schema deployen (siehe `backend/database/schema.ts`)

### 3. Sicherheit
- [ ] **KRITISCH**: `JWT_SECRET` durch starken, zufälligen Key ersetzen
- [ ] Alle "your-*" Platzhalter in `.env` durch echte Werte ersetzen
- [ ] `NODE_ENV=production` für Lambda setzen

## 🔧 Für vollständige Funktionalität:

### 4. Payment Provider
- [ ] Stripe Account erstellen und Keys eintragen
- [ ] PayPal Business Account und API Keys konfigurieren

### 5. Social Login (Optional)
- [ ] Google OAuth App erstellen
- [ ] Facebook App erstellen  
- [ ] Apple Developer Account für Sign in with Apple

### 6. Email Service
- [ ] AWS SES konfigurieren für Email-Versand
- [ ] SMTP Credentials eintragen

### 7. Push Notifications (Optional)
- [ ] Firebase Cloud Messaging Setup
- [ ] Apple Push Notification Service Setup

### 8. File Storage
- [ ] AWS S3 Bucket erstellen
- [ ] AWS Credentials konfigurieren

## 🚀 Deployment Steps:

### Lambda Backend:
1. `cd lambda/zestbetApi && npm install`
2. Lambda Function deployen
3. API Gateway URL kopieren
4. `.env` mit echter URL aktualisieren

### Frontend:
1. `npm install`
2. `expo build` oder über Amplify Hosting

## 🔍 Testing:
- [ ] API Endpoints testen: `https://your-api-url/status`
- [ ] tRPC Verbindung testen: `https://your-api-url/trpc`
- [ ] App auf echtem Gerät testen

## ⚠️ Bekannte Einschränkungen:
- WebSocket Support für Live-Features benötigt zusätzliche Konfiguration
- Redis für Caching ist optional, aber empfohlen für Performance