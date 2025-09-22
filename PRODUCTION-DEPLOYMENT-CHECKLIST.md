# 🚀 ZestBet Production Deployment Checklist

## ✅ Bereits Konfiguriert

### 1. Backend Infrastructure
- [x] **AWS Lambda Function**: `zestbetApi` erstellt
- [x] **API Gateway**: `pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com`
- [x] **Database**: Supabase PostgreSQL konfiguriert
- [x] **JWT Secret**: Sicherer 64-Zeichen Secret generiert
- [x] **Email Service**: Strato SMTP konfiguriert

### 2. Environment Variables
- [x] **TRPC URL**: Korrekt auf Lambda API Gateway gesetzt
- [x] **Database URL**: Mit URL-encoded Passwort
- [x] **Email Credentials**: Strato SMTP mit info@zestapp.online

## 🔧 Nächste Schritte für vollständige Produktion

### 3. Lambda Environment Variables setzen
Gehe zu AWS Lambda Console → `zestbetApi` → Configuration → Environment variables:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://postgres:9%26aHA*6K87%26V6cp@db.iwdfgtdfzjsgcnttkaob.supabase.co:5432/postgres
JWT_SECRET=zB9mK7pL3qR8sT2vW5xY1nM4jH6gF0dC9eA8bN7cV5xZ2wQ4rT6yU3iO1pL9mK8s
JWT_EXPIRES_IN=7d
EMAIL_FROM=info@zestapp.online
EMAIL_FROM_NAME=ZestBet
SMTP_HOST=smtp.strato.de
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@zestapp.online
SMTP_PASS=9&aHA*6K87&V6cp
```

### 4. Database Setup
```bash
# Führe die Datenbank-Migration aus:
cd backend/database
node migrate.js
```

### 5. Domain & SSL (Optional aber empfohlen)
- [ ] **Custom Domain**: Verbinde zestapp.online mit API Gateway
- [ ] **SSL Certificate**: AWS Certificate Manager für HTTPS

### 6. Payment Integration (für echte Zahlungen)
- [ ] **Stripe**: Live Keys für echte Zahlungen
- [ ] **PayPal**: Production Credentials

### 7. Social Login (Optional)
- [ ] **Google OAuth**: Production Client ID/Secret
- [ ] **Facebook Login**: Production App ID/Secret
- [ ] **Apple Sign In**: Production Certificates

### 8. Push Notifications (Optional)
- [ ] **FCM**: Firebase Cloud Messaging für Android
- [ ] **APNS**: Apple Push Notification Service für iOS

### 9. Monitoring & Analytics
- [ ] **CloudWatch**: AWS Logs für Lambda monitoring
- [ ] **Error Tracking**: Sentry oder ähnliches
- [ ] **Analytics**: App usage tracking

## 🧪 Testing

### API Test
```bash
# Teste deine API:
curl https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/status

# Teste tRPC:
curl -X POST https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/trpc/example.hi \
  -H "Content-Type: application/json" \
  -d '{"json":{}}'
```

### App Test
1. **Web**: Öffne https://zestapp.online
2. **Mobile**: Scanne QR Code in der App
3. **Registration**: Teste Email-Verifikation
4. **Login**: Teste Anmeldung

## 🔒 Sicherheit

### Bereits implementiert:
- [x] JWT Authentication
- [x] CORS Configuration
- [x] Input Validation
- [x] SQL Injection Protection
- [x] Password Hashing

### Zusätzliche Sicherheit:
- [ ] **Rate Limiting**: API Request limits
- [ ] **WAF**: Web Application Firewall
- [ ] **DDoS Protection**: CloudFlare oder AWS Shield

## 📱 App Store Deployment (Später)

### iOS App Store
- [ ] Apple Developer Account ($99/Jahr)
- [ ] App Store Connect Setup
- [ ] App Review Guidelines compliance

### Google Play Store
- [ ] Google Play Console Account ($25 einmalig)
- [ ] Play Store Listing
- [ ] Content Rating

## 💰 Kosten Übersicht

### Aktuelle monatliche Kosten:
- **AWS Lambda**: ~$0-5 (erste 1M requests kostenlos)
- **Supabase**: $0 (Free Tier bis 500MB)
- **Strato Email**: Bereits bezahlt
- **Domain**: Bereits bezahlt

### Bei Skalierung:
- **AWS Lambda**: $0.20 pro 1M requests
- **Supabase Pro**: $25/Monat (8GB Datenbank)
- **CloudFront CDN**: $1-10/Monat
- **Monitoring**: $5-20/Monat

## 🎯 Nächste Prioritäten

1. **Lambda Environment Variables setzen** (5 Minuten)
2. **Database Migration ausführen** (2 Minuten)
3. **API testen** (5 Minuten)
4. **App testen** (10 Minuten)
5. **Email-Verifikation testen** (5 Minuten)

**Total Zeit bis zur vollständigen Produktion: ~30 Minuten**

---

## 🆘 Support

Bei Problemen:
1. Prüfe AWS CloudWatch Logs
2. Teste API Endpoints einzeln
3. Prüfe Environment Variables
4. Kontaktiere Support wenn nötig

**Deine App ist zu 90% produktionsbereit! 🎉**