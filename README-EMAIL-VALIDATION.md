# Email-Validierungssystem mit AWS SES

## Übersicht

Das Email-Validierungssystem für ZestBet nutzt AWS SES (Simple Email Service) um professionelle, zuverlässige Email-Verifikation zu gewährleisten. Neue Benutzer müssen ihre Email-Adresse bestätigen, bevor sie sich anmelden können.

## Funktionen

### 1. Registrierung mit Email-Verifikation
- Benutzer registrieren sich mit Email, Passwort und Namen
- System generiert 4-stelligen Verifikationscode
- Verifikations-Email wird über AWS SES gesendet
- Account-Status: `pending_verification`

### 2. Email-Verifikation
- Benutzer gibt 4-stelligen Code ein
- Code ist 15 Minuten gültig
- Nach erfolgreicher Verifikation: Account-Status wird auf `active` gesetzt
- Willkommens-Email wird gesendet

### 3. Login-Beschränkung
- Nur verifizierte Accounts können sich anmelden
- Nicht-verifizierte Accounts erhalten Fehlermeldung mit Hinweis zur Verifikation

### 4. Code erneut senden
- Benutzer können neuen Verifikationscode anfordern
- 60 Sekunden Wartezeit zwischen Anfragen

### 5. Passwort-Reset
- Benutzer können Passwort über Email zurücksetzen
- 4-stelliger Reset-Code wird gesendet
- Code ist 15 Minuten gültig

## AWS SES Konfiguration

### Umgebungsvariablen
```env
# AWS Credentials
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key

# AWS SES Spezifisch
AWS_SES_REGION=eu-central-1
AWS_SES_FROM_EMAIL=noreply@zestbet.com
AWS_SES_FROM_NAME=ZestBet
```

### AWS SES Setup

1. **Domain verifizieren**
   ```bash
   # In AWS SES Console
   # 1. Gehe zu "Verified identities"
   # 2. Klicke "Create identity"
   # 3. Wähle "Domain" und gib deine Domain ein (z.B. zestbet.com)
   # 4. Folge den DNS-Verifikationsschritten
   ```

2. **Email-Adresse verifizieren** (für Entwicklung)
   ```bash
   # Für Entwicklung kannst du einzelne Email-Adressen verifizieren
   # 1. Gehe zu "Verified identities"
   # 2. Klicke "Create identity"
   # 3. Wähle "Email address"
   # 4. Gib deine Test-Email ein
   ```

3. **Sandbox-Modus verlassen** (für Produktion)
   ```bash
   # Für Produktion musst du aus dem Sandbox-Modus raus
   # 1. Gehe zu "Account dashboard"
   # 2. Klicke "Request production access"
   # 3. Fülle das Formular aus
   ```

4. **IAM-Berechtigungen**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ses:SendEmail",
           "ses:SendRawEmail"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

## API-Endpunkte

### 1. Registrierung
```typescript
// POST /api/trpc/auth.register
{
  email: "user@example.com",
  password: "password123",
  name: "Max Mustermann",
  phone?: "+49123456789"
}

// Response
{
  success: true,
  message: "Account created successfully! Please check your email for the verification code.",
  userId: "user-id",
  requiresEmailVerification: true,
  requiresPhoneVerification: false
}
```

### 2. Email-Verifikation
```typescript
// POST /api/trpc/auth.verifyEmail
{
  email: "user@example.com",
  code: "1234"
}

// Response
{
  success: true,
  message: "Email verified successfully! Welcome to ZestBet!",
  isFullyVerified: true
}
```

### 3. Code erneut senden
```typescript
// POST /api/trpc/auth.resendVerification
{
  email: "user@example.com"
}

// Response
{
  success: true,
  message: "New verification code sent to your email address."
}
```

### 4. Passwort vergessen
```typescript
// POST /api/trpc/auth.forgotPassword
{
  email: "user@example.com"
}

// Response
{
  success: true,
  message: "If an account with this email exists, you will receive a password reset code."
}
```

### 5. Passwort zurücksetzen
```typescript
// POST /api/trpc/auth.resetPassword
{
  email: "user@example.com",
  resetCode: "1234",
  newPassword: "newpassword123"
}

// Response
{
  success: true,
  message: "Password reset successfully! You can now log in with your new password."
}
```

## Email-Templates

### 1. Verifikations-Email
- **Betreff**: "Email-Adresse bestätigen - ZestBet"
- **Inhalt**: Professionelles HTML-Template mit 4-stelligem Code
- **Gültigkeit**: 15 Minuten
- **Sprache**: Deutsch

### 2. Willkommens-Email
- **Betreff**: "Willkommen bei ZestBet! 🎉"
- **Inhalt**: Willkommensnachricht mit 1.000 ZEST Coins Bonus
- **Features**: Übersicht der verfügbaren Funktionen

### 3. Passwort-Reset-Email
- **Betreff**: "Passwort zurücksetzen - ZestBet"
- **Inhalt**: Sicherheitshinweise und 4-stelliger Reset-Code
- **Gültigkeit**: 15 Minuten

## Sicherheitsfeatures

### 1. Code-Generierung
- 4-stellige numerische Codes (1000-9999)
- Kryptographisch sichere Zufallsgenerierung
- Einmalige Verwendung

### 2. Zeitbasierte Gültigkeit
- Codes sind nur 15 Minuten gültig
- Automatische Bereinigung abgelaufener Codes

### 3. Rate-Limiting
- 60 Sekunden Wartezeit zwischen Code-Anfragen
- Schutz vor Spam und Missbrauch

### 4. Domain-Validierung
- Nur erlaubte Email-Domains werden akzeptiert
- Schutz vor Wegwerf-Email-Adressen

### 5. Account-Status-Tracking
- Verschiedene Status: `pending_verification`, `active`, `suspended`, `banned`
- Granulare Kontrolle über Account-Zugriff

## Fehlerbehandlung

### 1. Email-Versand-Fehler
- Graceful Degradation: Registrierung schlägt nicht fehl
- Logging für Debugging
- Retry-Mechanismus für kritische Emails

### 2. Ungültige Codes
- Klare Fehlermeldungen
- Hinweise zur Code-Anforderung

### 3. Abgelaufene Codes
- Automatische Bereinigung
- Option zum erneuten Senden

## Monitoring und Logging

### 1. Email-Versand-Logs
```typescript
console.log('Email sent successfully:', result.MessageId);
console.log(`Verification email sent to ${email}`);
```

### 2. Verifikations-Logs
```typescript
console.log(`New user registered: ${email} with ID: ${user.id}`);
console.log(`Email verified for user: ${email}`);
```

### 3. Fehler-Logs
```typescript
console.error('Failed to send email:', error);
console.error('Failed to verify email:', error);
```

## Entwicklung vs. Produktion

### Entwicklung
- AWS SES Sandbox-Modus
- Nur verifizierte Email-Adressen
- Console-Logs für Debugging
- Test-Codes in Logs sichtbar

### Produktion
- AWS SES Produktions-Zugang
- Alle Email-Adressen erlaubt
- Strukturiertes Logging
- Monitoring und Alerting

## Kosten

### AWS SES Preise (Stand 2024)
- **Erste 62.000 Emails/Monat**: Kostenlos
- **Danach**: $0.10 pro 1.000 Emails
- **Sehr kostengünstig** für die meisten Anwendungen

## Nächste Schritte

1. **AWS SES konfigurieren**
   - Domain verifizieren
   - Produktions-Zugang beantragen
   - IAM-Berechtigungen einrichten

2. **Umgebungsvariablen setzen**
   - AWS Credentials
   - SES-spezifische Konfiguration

3. **Testing**
   - Registrierung testen
   - Email-Empfang prüfen
   - Verifikations-Flow testen

4. **Monitoring einrichten**
   - CloudWatch für SES-Metriken
   - Application-Logs
   - Error-Alerting

Das Email-Validierungssystem ist jetzt vollständig implementiert und bereit für den Einsatz!