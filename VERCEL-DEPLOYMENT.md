# Vercel Deployment Guide für MyCaredaddy/ZestApp

## Übersicht

Die App ist jetzt vollständig auf Vercel konfiguriert. Backend und API laufen als Serverless Functions.

## Deployment-Schritte

### 1. Vercel-Projekt erstellen

1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke auf "New Project"
3. Importiere dein GitHub-Repository
4. Wähle das Root-Verzeichnis

### 2. Environment Variables konfigurieren

Füge folgende Environment Variables in Vercel hinzu (Settings > Environment Variables):

#### Database (Supabase)
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://user:password@host:port/database
```

#### Authentication
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
```

#### Email (SendGrid)
```
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@mycaredaddy.com
```

#### SMS (Twilio)
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+49123456789
```

#### Payment (Stripe)
```
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_premium_monthly
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_premium_yearly
```

#### Monitoring (Sentry)
```
SENTRY_DSN=your_sentry_dsn
APP_VERSION=2.0.0
```

#### Firebase (Push Notifications)
```
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

#### Analytics
```
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
POSTHOG_API_KEY=your_posthog_api_key
POSTHOG_HOST=https://app.posthog.com
```

#### Customer Support
```
ZENDESK_SUBDOMAIN=your_zendesk_subdomain
ZENDESK_EMAIL=support@mycaredaddy.com
ZENDESK_TOKEN=your_zendesk_token
```

#### URLs
```
FRONTEND_URL=https://mycaredaddy.com
BACKEND_URL=https://your-project.vercel.app
NODE_ENV=production
```

#### Rate Limiting
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
```

### 3. Build Settings

Vercel erkennt automatisch:
- **Framework Preset**: Other
- **Build Command**: (leer lassen - keine Build notwendig)
- **Output Directory**: (leer lassen)
- **Install Command**: `npm install`

### 4. Domain konfigurieren

#### Für zestapp.online:
1. Gehe zu Vercel Project Settings > Domains
2. Füge `zestapp.online` hinzu
3. Füge `www.zestapp.online` hinzu
4. Vercel zeigt dir die DNS-Einstellungen

#### Bei Strato DNS konfigurieren:
1. Logge dich bei Strato ein
2. Gehe zu Domain-Verwaltung > DNS-Einstellungen
3. Füge folgende Records hinzu:

**Für Root-Domain (zestapp.online):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**Für www-Subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Für API-Subdomain (optional):**
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
TTL: 3600
```

### 5. Deployment testen

Nach dem Deployment:

1. **Health Check testen:**
```bash
curl https://your-project.vercel.app/api/health
```

2. **tRPC Endpoint testen:**
```bash
curl https://your-project.vercel.app/api/trpc/example.hi
```

3. **Status prüfen:**
```bash
curl https://your-project.vercel.app/api/status
```

### 6. Frontend-Konfiguration aktualisieren

Die App ist bereits konfiguriert, um Vercel zu verwenden. Wenn du eine eigene Domain hast, aktualisiere:

1. In `lib/config.ts` die Production URLs
2. In `vercel.json` die CORS Origins
3. Deploye erneut

## Vorteile von Vercel

✅ **Automatische Deployments** - Bei jedem Git Push  
✅ **Serverless Functions** - Skaliert automatisch  
✅ **Edge Network** - Schnelle globale Verfügbarkeit  
✅ **Zero Configuration** - Funktioniert out-of-the-box  
✅ **Preview Deployments** - Für jeden Branch  
✅ **SSL/HTTPS** - Automatisch inklusive  
✅ **Environment Variables** - Einfache Verwaltung  
✅ **Logs & Analytics** - Integriertes Monitoring  

## Troubleshooting

### API antwortet nicht
- Prüfe Environment Variables in Vercel
- Schaue in die Function Logs (Vercel Dashboard)
- Teste mit `/api/health` Endpoint

### CORS Fehler
- Füge deine Domain in `api/index.ts` CORS config hinzu
- Deploye erneut

### Database Connection Fehler
- Prüfe `DATABASE_URL` in Environment Variables
- Stelle sicher, dass Supabase-Credentials korrekt sind
- Prüfe Supabase Connection Pooling Settings

### Timeout Errors
- Vercel Serverless Functions haben 30s Timeout (konfiguriert)
- Für längere Operationen: Background Jobs verwenden

## Nächste Schritte

1. ✅ Vercel-Projekt erstellen
2. ✅ Environment Variables hinzufügen
3. ✅ Domain konfigurieren
4. ✅ Deployment testen
5. ⏳ Drittanbieter-Services konfigurieren (Supabase, SendGrid, etc.)
6. ⏳ Production Testing durchführen
7. ⏳ Monitoring einrichten (Sentry)

## Support

Bei Problemen:
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- GitHub Issues: Erstelle ein Issue im Repository
