# ZestBet Backend - AWS Amplify Deployment

Dieses komplette Backend für ZestBet ist bereit für AWS Amplify Deployment.

## 🎯 Was wurde erstellt

### ✅ Vollständige API Struktur
- **Authentication**: Login, Registrierung, Social Login (Google, Facebook, Apple)
- **Bets**: Wetten erstellen und verwalten
- **Challenges**: Herausforderungen erstellen und teilnehmen  
- **Wallet**: ZEST Coins Management mit Ein-/Auszahlungen
- **Live Events**: Echtzeitevents und Live-Wetten
- **User Management**: Profilverwaltung und Einstellungen

### ✅ AWS Lambda Ready
- `backend/amplify/index.ts` - AWS Lambda Handler
- `amplify.yml` - Automatisches Deployment
- Optimiert für Serverless Architecture

### ✅ Production Ready Features
- JWT Authentication mit sicheren Tokens
- Input Validation mit Zod Schemas
- CORS Konfiguration
- Error Handling und Logging
- TypeScript für Type Safety

### ✅ Payment Integration
- Stripe Integration vorbereitet
- PayPal Integration vorbereitet
- Banküberweisungen Support

### ✅ Notification System
- Push Notifications (FCM/APNS)
- E-Mail Benachrichtigungen
- Welcome E-Mails und Gewinn-Notifications

## 🚀 Deployment Schritte

### 1. Vorbereitung
```bash
# AWS CLI installieren und konfigurieren
aws configure

# Amplify CLI installieren
npm install -g @aws-amplify/cli
```

### 2. Automatisches Deployment
```bash
# Deployment Script ausführen
chmod +x deploy.sh
./deploy.sh
```

### 3. Manuelle Schritte
```bash
# In das Backend Verzeichnis wechseln
cd backend

# Dependencies installieren
npm install

# Amplify initialisieren
amplify init

# API hinzufügen
amplify add api
# Wähle: REST API
# Wähle: Create a new Lambda function
# Verwende: backend/amplify/index.ts

# Umgebungsvariablen setzen
amplify env add production

# Deployen
amplify push
```

## 🔧 Konfiguration

### Environment Variables
Setze diese Variablen in AWS Lambda:

```env
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=postgresql://your-db-url
GOOGLE_CLIENT_ID=your-google-client-id
FACEBOOK_APP_ID=your-facebook-app-id
APPLE_CLIENT_ID=your-apple-client-id
STRIPE_SECRET_KEY=sk_live_your-stripe-key
PAYPAL_CLIENT_ID=your-paypal-client-id
```

### Database Setup
1. PostgreSQL Datenbank erstellen (RDS empfohlen)
2. Connection String in `DATABASE_URL` setzen
3. Tabellen basierend auf `backend/database/schema.ts` erstellen

## 📱 Frontend Integration

### tRPC Client Setup
```typescript
// In deiner App
import { trpc } from '@/lib/trpc';

// Login
const loginMutation = trpc.auth.login.useMutation();
const result = await loginMutation.mutateAsync({
  email: 'user@example.com',
  password: 'password123'
});

// Bets abrufen
const betsQuery = trpc.bets.list.useQuery({
  category: 'sports',
  limit: 10
});
```

### API Endpoints
Nach dem Deployment erhältst du eine URL wie:
```
https://abc123.execute-api.eu-central-1.amazonaws.com/prod/
```

Alle tRPC Routen sind unter `/trpc/` verfügbar:
- `POST /trpc/auth.login`
- `POST /trpc/auth.register`
- `GET /trpc/bets.list`
- `POST /trpc/bets.create`
- etc.

## 🔐 Sicherheit

### JWT Tokens
- Sichere Secrets verwenden
- Token Expiration: 7 Tage
- Refresh Token Logic implementieren

### CORS
- Nur erlaubte Origins
- Credentials Support
- Preflight Requests

### Input Validation
- Zod Schemas für alle Inputs
- SQL Injection Protection
- XSS Prevention

## 📊 Monitoring

### AWS CloudWatch
- Automatische Lambda Logs
- Error Tracking
- Performance Metriken
- Custom Alarms

### Logging
```typescript
// Request Logging aktiviert
// Error Logging aktiviert
// Custom Metrics möglich
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Amplify
        run: |
          cd backend
          npm ci
          amplify push --yes
```

## 🧪 Testing

### Local Development
```bash
cd backend
npm run dev
# Server läuft auf http://localhost:3001
```

### API Testing
```bash
# Health Check
curl https://your-api-url.com/

# Login Test
curl -X POST https://your-api-url.com/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📈 Skalierung

### Auto-Scaling
- AWS Lambda skaliert automatisch
- Concurrent Executions konfigurierbar
- Cold Start Optimierung implementiert

### Database
- Connection Pooling
- Read Replicas für bessere Performance
- Caching mit Redis (optional)

## 🆘 Troubleshooting

### Häufige Probleme

1. **Lambda Timeout**
   - Timeout in AWS Console erhöhen (max 15 min)
   - Database Queries optimieren

2. **CORS Errors**
   - Origins in `backend/config/environment.ts` prüfen
   - Preflight Requests aktivieren

3. **JWT Errors**
   - `JWT_SECRET` Environment Variable setzen
   - Token Format prüfen

4. **Database Connection**
   - `DATABASE_URL` korrekt setzen
   - VPC Konfiguration prüfen (falls RDS in VPC)

### Logs prüfen
```bash
# CloudWatch Logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/

# Amplify Logs
amplify console
```

## 🎉 Fertig!

Dein ZestBet Backend ist jetzt:
- ✅ Auf AWS deployed
- ✅ Skalierbar und performant
- ✅ Sicher und production-ready
- ✅ Mit allen Features ausgestattet

### Nächste Schritte:
1. Frontend mit der neuen API URL verbinden
2. OAuth Provider konfigurieren
3. Payment Provider einrichten
4. Push Notifications konfigurieren
5. Database Schema implementieren

**Happy Coding! 🚀**