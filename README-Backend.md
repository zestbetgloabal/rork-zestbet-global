# ZestBet Backend

Ein vollständiges Backend für die ZestBet App, entwickelt mit Hono, tRPC und TypeScript, optimiert für AWS Amplify Deployment.

## 🚀 Features

- **Authentication**: Login, Registrierung, Social Login (Google, Facebook, Apple)
- **Bets**: Wetten erstellen, verwalten und auflisten
- **Challenges**: Herausforderungen erstellen und teilnehmen
- **Wallet**: ZEST Coins verwalten, Ein- und Auszahlungen
- **Live Events**: Echtzeitevents und Live-Wetten
- **User Management**: Profilverwaltung und Einstellungen
- **Notifications**: Push-Benachrichtigungen und E-Mails
- **Payments**: Stripe, PayPal und Banküberweisungen

## 🛠 Tech Stack

- **Framework**: Hono (Fast web framework)
- **API**: tRPC (Type-safe APIs)
- **Language**: TypeScript
- **Validation**: Zod
- **Authentication**: JWT
- **Deployment**: AWS Lambda (via Amplify)
- **Database**: PostgreSQL (konfigurierbar)

## 📁 Projektstruktur

```
backend/
├── amplify/
│   └── index.ts              # AWS Lambda Handler
├── config/
│   └── environment.ts        # Umgebungskonfiguration
├── database/
│   └── schema.ts            # Datenbankschema
├── middleware/
│   ├── auth.ts              # Authentifizierung
│   ├── cors.ts              # CORS Konfiguration
│   └── logger.ts            # Request Logging
├── services/
│   ├── notification.ts      # Push Notifications
│   └── payment.ts           # Zahlungsabwicklung
├── trpc/
│   ├── routes/
│   │   ├── auth/            # Authentifizierung
│   │   ├── bets/            # Wetten
│   │   ├── challenges/      # Herausforderungen
│   │   ├── user/            # Benutzerverwaltung
│   │   ├── wallet/          # Wallet Management
│   │   └── live-events/     # Live Events
│   ├── app-router.ts        # Haupt-Router
│   └── create-context.ts    # tRPC Kontext
├── utils/
│   ├── auth.ts              # Auth Utilities
│   └── database.ts          # Database Utilities
└── hono.ts                  # Hono App (Development)
```

## 🔧 Installation

1. **Dependencies installieren**:
   ```bash
   cd backend
   npm install
   ```

2. **Umgebungsvariablen konfigurieren**:
   ```bash
   cp .env.example .env
   # .env Datei mit deinen Werten ausfüllen
   ```

3. **Development Server starten**:
   ```bash
   npm run dev
   ```

## 🌐 AWS Amplify Deployment

### Vorbereitung

1. **AWS CLI installieren und konfigurieren**:
   ```bash
   aws configure
   ```

2. **Amplify CLI installieren**:
   ```bash
   npm install -g @aws-amplify/cli
   ```

### Deployment Schritte

1. **Amplify Projekt initialisieren**:
   ```bash
   amplify init
   ```

2. **API hinzufügen**:
   ```bash
   amplify add api
   # Wähle REST API
   # Lambda Function als Datenquelle
   ```

3. **Umgebungsvariablen setzen**:
   ```bash
   amplify env add production
   # Setze alle notwendigen Environment Variables
   ```

4. **Deployen**:
   ```bash
   amplify push
   ```

### Automatisches Deployment

Die `amplify.yml` Datei konfiguriert automatisches Deployment:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci
        - npm run build
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
```

## 🔐 Authentifizierung

### JWT Token

```typescript
// Login
const result = await trpc.auth.login.mutate({
  email: 'user@example.com',
  password: 'password123'
});

// Token in Authorization Header verwenden
fetch('/api/trpc/user.profile', {
  headers: {
    'Authorization': `Bearer ${result.token}`
  }
});
```

### Social Login

```typescript
// Google Login
const result = await trpc.auth.socialLogin.mutate({
  provider: 'google',
  token: 'google-oauth-token',
  email: 'user@gmail.com',
  name: 'User Name'
});
```

## 💰 Wallet & Payments

### Balance abfragen

```typescript
const balance = await trpc.wallet.balance.query();
console.log(`Balance: ${balance.balance} ZEST`);
```

### Einzahlung

```typescript
const deposit = await trpc.wallet.deposit.mutate({
  amount: 100,
  paymentMethod: 'credit_card',
  paymentDetails: {
    cardNumber: '4111111111111111',
    expiryDate: '12/25',
    cvv: '123'
  }
});
```

## 🎯 Bets & Challenges

### Wette erstellen

```typescript
const bet = await trpc.bets.create.mutate({
  title: 'Deutschland gewinnt die EM 2024',
  description: 'Wette auf den Sieg der deutschen Nationalmannschaft',
  amount: 50,
  category: 'sports',
  endDate: new Date('2024-07-14'),
  isPublic: true
});
```

### Challenge erstellen

```typescript
const challenge = await trpc.challenges.create.mutate({
  title: '30 Tage Fitness Challenge',
  description: 'Jeden Tag 30 Minuten Sport',
  type: 'fitness',
  duration: 30,
  reward: 100,
  isPublic: true
});
```

## 📱 Push Notifications

```typescript
import { NotificationService } from './services/notification';

// Push Notification senden
await NotificationService.sendPushNotification('user-id', {
  title: '🎉 Glückwunsch!',
  body: 'Du hast eine Wette gewonnen!',
  data: { type: 'bet_win', amount: 100 }
});

// E-Mail senden
await NotificationService.sendWelcomeEmail(
  'user@example.com',
  'Max Mustermann'
);
```

## 🔧 Konfiguration

### Umgebungsvariablen

Wichtige Umgebungsvariablen in `.env`:

```env
# JWT
JWT_SECRET=your-super-secret-jwt-key

# Database
DATABASE_URL=postgresql://localhost:5432/zestbet

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
FACEBOOK_APP_ID=your-facebook-app-id
APPLE_CLIENT_ID=your-apple-client-id

# Payments
STRIPE_SECRET_KEY=sk_test_your-stripe-key
PAYPAL_CLIENT_ID=your-paypal-client-id

# AWS
AWS_REGION=eu-central-1
AWS_S3_BUCKET=zestbet-uploads
```

## 🧪 Testing

```bash
# Tests ausführen
npm test

# Type Checking
npm run type-check

# Linting
npm run lint
```

## 📊 Monitoring

### AWS CloudWatch

- Lambda Logs werden automatisch in CloudWatch gespeichert
- Metriken für API Calls, Errors und Performance
- Alarms für kritische Fehler

### Custom Logging

```typescript
// Request Logging
app.use('*', loggerMiddleware);

// Error Logging
app.use('*', errorLoggerMiddleware);
```

## 🔒 Sicherheit

- **JWT Authentication** mit sicheren Secrets
- **CORS** Konfiguration für erlaubte Origins
- **Input Validation** mit Zod Schemas
- **Rate Limiting** (TODO: implementieren)
- **SQL Injection Protection** durch ORM/Query Builder

## 🚀 Performance

- **Lambda Cold Start Optimization**
- **Database Connection Pooling**
- **Caching mit Redis** (optional)
- **CDN für statische Assets**

## 📈 Skalierung

- **Serverless Architecture** mit AWS Lambda
- **Auto-Scaling** basierend auf Traffic
- **Database Read Replicas** für bessere Performance
- **Microservices Architecture** möglich

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📄 Lizenz

MIT License - siehe LICENSE Datei für Details.

## 🆘 Support

Bei Fragen oder Problemen:

1. Überprüfe die Logs in AWS CloudWatch
2. Stelle sicher, dass alle Umgebungsvariablen gesetzt sind
3. Überprüfe die AWS IAM Berechtigungen
4. Kontaktiere das Entwicklerteam

---

**Happy Coding! 🎉**