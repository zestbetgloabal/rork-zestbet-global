# AWS Deployment Guide für ZestBet Backend

Dieses Guide erklärt, wie Sie das ZestBet Backend auf AWS deployen.

## 🚀 Schnell-Start

### 1. Voraussetzungen installieren

```bash
# AWS CLI installieren (falls nicht vorhanden)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# AWS Credentials konfigurieren
aws configure
```

### 2. Backend auf AWS Lambda deployen

```bash
# Deployment Script ausführbar machen
chmod +x deploy-aws.sh

# Backend deployen
./deploy-aws.sh
```

### 3. PostgreSQL Datenbank erstellen

```bash
# RDS Setup Script ausführbar machen
chmod +x setup-rds.sh

# RDS PostgreSQL Datenbank erstellen
./setup-rds.sh
```

### 4. Datenbank Migration ausführen

```bash
# Migration ausführen (nach RDS Setup)
npm run db:migrate
```

## 📋 Detaillierte Schritte

### AWS Lambda Deployment

Das `deploy-aws.sh` Script erstellt automatisch:

- ✅ Lambda Function mit Hono Backend
- ✅ API Gateway für HTTP Requests
- ✅ IAM Rollen und Permissions
- ✅ Environment Variables
- ✅ .env.production Datei

**Ausgabe nach erfolgreichem Deployment:**
```
🎉 Deployment erfolgreich abgeschlossen!
========================================

📍 API Endpoints:
   Base URL:     https://abc123.execute-api.eu-central-1.amazonaws.com/prod
   API URL:      https://abc123.execute-api.eu-central-1.amazonaws.com/prod/api
   tRPC URL:     https://abc123.execute-api.eu-central-1.amazonaws.com/prod/api/trpc
   Health Check: https://abc123.execute-api.eu-central-1.amazonaws.com/prod/api/status
```

### RDS PostgreSQL Setup

Das `setup-rds.sh` Script erstellt:

- ✅ RDS PostgreSQL Instanz (db.t3.micro - 12 Monate kostenlos)
- ✅ Sichere Credentials
- ✅ Automatische .env.production Aktualisierung

**Wichtige Informationen:**
- **Instance Class:** db.t3.micro (kostenlos für neue AWS Accounts)
- **Storage:** 20GB (Minimum)
- **Backup:** 7 Tage Retention
- **Verschlüsselung:** Aktiviert

## 🔧 Konfiguration

### Environment Variables

Nach dem Deployment werden diese URLs automatisch in `.env.production` gesetzt:

```env
# AWS Production Environment
EXPO_PUBLIC_API_URL=https://your-api-id.execute-api.eu-central-1.amazonaws.com/prod/api
EXPO_PUBLIC_TRPC_URL=https://your-api-id.execute-api.eu-central-1.amazonaws.com/prod/api/trpc

# Database
DATABASE_URL=postgresql://zestbet_admin:password@your-db-endpoint:5432/zestbet

# JWT
JWT_SECRET=your-generated-secret
JWT_EXPIRES_IN=7d

# AWS
AWS_REGION=eu-central-1
NODE_ENV=production
```

### App Konfiguration

Kopieren Sie die URLs aus `.env.production` in Ihre App:

```typescript
// In Ihrer App
const API_URL = 'https://your-api-id.execute-api.eu-central-1.amazonaws.com/prod/api';
const TRPC_URL = 'https://your-api-id.execute-api.eu-central-1.amazonaws.com/prod/api/trpc';
```

## 🧪 Testing

### API Health Check

```bash
# Testen Sie die API
curl https://your-api-id.execute-api.eu-central-1.amazonaws.com/prod/api/status
```

**Erwartete Antwort:**
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "email": "configured",
    "auth": "active"
  },
  "uptime": 123.45,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### tRPC Endpoint Test

```bash
# Testen Sie tRPC
curl https://your-api-id.execute-api.eu-central-1.amazonaws.com/prod/api/trpc/example.hi
```

### Datenbank Verbindung Test

```bash
# Verbinden Sie sich zur Datenbank
psql postgresql://zestbet_admin:password@your-db-endpoint:5432/zestbet
```

## 💰 Kosten

### AWS Lambda
- **Kostenlos:** 1M Requests/Monat + 400.000 GB-Sekunden
- **Danach:** ~$0.20 pro 1M Requests

### RDS db.t3.micro
- **Kostenlos:** 12 Monate für neue AWS Accounts
- **Danach:** ~€15-20/Monat

### API Gateway
- **Kostenlos:** 1M API Calls/Monat
- **Danach:** ~$3.50 pro 1M Calls

## 🔄 Updates

### Backend Code Update

```bash
# Neuen Code deployen
./deploy-aws.sh
```

### Datenbank Schema Update

```bash
# Migration ausführen
npm run db:migrate
```

### Environment Variables Update

```bash
# Lambda Environment Variables aktualisieren
aws lambda update-function-configuration \
  --function-name zestbet-backend \
  --environment Variables='{DATABASE_URL=new-url,JWT_SECRET=new-secret}'
```

## 🛠️ Troubleshooting

### Lambda Function Logs

```bash
# Logs anzeigen
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/zestbet-backend

# Neueste Logs
aws logs tail /aws/lambda/zestbet-backend --follow
```

### API Gateway Logs

```bash
# API Gateway Logs aktivieren
aws apigateway update-stage \
  --rest-api-id your-api-id \
  --stage-name prod \
  --patch-ops op=replace,path=/accessLogSettings/destinationArn,value=arn:aws:logs:region:account:log-group:api-gateway-logs
```

### RDS Connection Issues

```bash
# RDS Status prüfen
aws rds describe-db-instances --db-instance-identifier zestbet-db

# Security Group prüfen (Port 5432 muss offen sein)
aws ec2 describe-security-groups --group-ids sg-your-security-group
```

## 🔒 Sicherheit

### IAM Permissions

Die Scripts erstellen minimale IAM Rollen mit nur notwendigen Permissions:

- Lambda Execution Role
- API Gateway Invoke Permission
- RDS Connect Permission

### Database Security

- Verschlüsselung aktiviert
- Sichere Passwörter generiert
- Backup aktiviert

### API Security

- CORS konfiguriert
- Rate Limiting aktiviert
- JWT Authentication

## 📞 Support

Bei Problemen:

1. Prüfen Sie die AWS CloudWatch Logs
2. Testen Sie die API Endpoints einzeln
3. Überprüfen Sie die Environment Variables
4. Stellen Sie sicher, dass alle AWS Services in derselben Region sind

## 🎯 Nächste Schritte

Nach erfolgreichem Deployment:

1. ✅ Testen Sie alle API Endpoints
2. ✅ Führen Sie Datenbank Migrationen aus
3. ✅ Aktualisieren Sie Ihre Mobile App mit den neuen URLs
4. ✅ Konfigurieren Sie Monitoring und Alerts
5. ✅ Setup CI/CD für automatische Deployments