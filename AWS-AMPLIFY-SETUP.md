# AWS Amplify Backend Setup - Vollständige Anleitung

## 🎯 Übersicht
Dein ZestBet Backend läuft jetzt auf AWS Amplify mit Serverless Functions. Hier ist die komplette Setup-Anleitung:

## 📋 1. Amplify Console Konfiguration

### Environment Variables in Amplify Console setzen:
Gehe zu deiner Amplify App → Environment variables und füge hinzu:

```bash
# Database
DATABASE_URL=postgresql://postgres:9%26aHA*6K87%26V6cp@db.iwdfgtdfzjsgcnttkaob.supabase.co:5432/postgres

# JWT
JWT_SECRET=zB9mK7pL3qR8sT2vW5xY1nM4jH6gF0dC9eA8bN7cV5xZ2wQ4rT6yU3iO1pL9mK8s
JWT_EXPIRES_IN=7d

# Email (Gmail SMTP)
EMAIL_FROM=zestbetglobal@gmail.com
EMAIL_FROM_NAME=ZestBet
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=zestbetglobal@gmail.com
SMTP_PASS=mbdtvyrwhqdvqxf

# AWS
AWS_REGION=eu-central-1
NODE_ENV=production
```

## 🚀 2. Deployment

### Automatisches Deployment:
- Jeder Push zu deinem Main-Branch triggert automatisch ein neues Deployment
- Das Frontend (React Native Web) und Backend (Lambda) werden zusammen deployed

### Manuelles Deployment:
```bash
# In der Amplify Console → App → Redeploy this version
```

## 🔗 3. API Endpoints

Nach dem Deployment sind deine APIs verfügbar unter:
- **tRPC API**: `https://zestapp.online/api/trpc`
- **REST API**: `https://zestapp.online/api`
- **Health Check**: `https://zestapp.online/api/status`

## 🧪 4. Testing

### API Test:
```bash
curl https://zestapp.online/api/status
```

### tRPC Test:
```bash
curl https://zestapp.online/api/trpc/example.hi
```

## 📱 5. Mobile App Konfiguration

Deine `.env` ist bereits korrekt konfiguriert:
```bash
EXPO_PUBLIC_TRPC_URL=https://zestapp.online/api/trpc
EXPO_PUBLIC_API_URL=https://zestapp.online/api
```

## 🔧 6. Troubleshooting

### Häufige Probleme:

1. **Lambda Cold Start**: Erste Anfrage kann langsam sein
2. **Environment Variables**: Müssen in Amplify Console gesetzt werden
3. **CORS**: Bereits konfiguriert für deine Domain

### Logs anzeigen:
- Amplify Console → App → Monitoring → Function logs

## 🎉 7. Nächste Schritte

1. **Deployment testen**: Push einen kleinen Change und schaue ob alles funktioniert
2. **Environment Variables setzen**: In der Amplify Console
3. **API testen**: Mit deiner Mobile App
4. **Monitoring einrichten**: CloudWatch Logs überwachen

## 📞 Support

Bei Problemen:
1. Amplify Console Logs checken
2. CloudWatch Logs anschauen
3. API Endpoints direkt testen

Dein Backend ist jetzt production-ready auf AWS Amplify! 🚀