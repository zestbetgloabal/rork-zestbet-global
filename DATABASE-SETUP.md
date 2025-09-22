# 🚀 ZestBet Database Setup Guide

## Schritt 1: Supabase Passwort eintragen

1. Öffne die `.env` Datei
2. Ersetze `[YOUR-PASSWORD]` mit deinem echten Supabase Passwort:

```bash
DATABASE_URL=postgresql://postgres:DEIN_ECHTES_PASSWORT@db.iwdfgtdfzjsgcnttkaob.supabase.co:5432/postgres
```

## Schritt 2: Datenbank-Tabellen erstellen

Führe das Migrations-Script aus:

```bash
node backend/database/migrate.js
```

Das Script wird:
- ✅ Alle notwendigen Tabellen erstellen (users, bets, challenges, etc.)
- ✅ Test-Accounts anlegen
- ✅ Indizes für bessere Performance erstellen

## Schritt 3: Lambda Backend aktualisieren

Deine Lambda-Funktion muss auch die Datenbankverbindung nutzen. Stelle sicher, dass:

1. Die Lambda-Umgebungsvariablen `DATABASE_URL` gesetzt sind
2. Die Lambda-Funktion die PostgreSQL-Abhängigkeiten hat
3. Die VPC-Konfiguration korrekt ist (falls nötig)

## Schritt 4: Testen

Nach dem Setup kannst du:

1. **Frontend testen**: Die App sollte sich mit echten Daten verbinden
2. **Login testen**: Mit den Test-Accounts:
   - `test@example.com` / `password123`
   - `pinkpistachio72@gmail.com` / `zestapp2025#`
   - `admin@zestbet.com` / `admin2025!`

## Troubleshooting

### Verbindungsfehler?
- Überprüfe das Passwort in der DATABASE_URL
- Stelle sicher, dass deine IP in Supabase freigegeben ist
- Prüfe die Supabase-Firewall-Einstellungen

### Lambda-Probleme?
- Stelle sicher, dass die Lambda-Funktion Zugriff auf das Internet hat
- Überprüfe die VPC-Konfiguration
- Prüfe die Lambda-Logs in CloudWatch

### Performance-Probleme?
- Die Datenbank hat bereits Indizes für häufige Abfragen
- Bei vielen Nutzern: Connection Pooling aktivieren
- Monitoring in Supabase Dashboard aktivieren

## Nächste Schritte

1. **Produktions-Secrets**: JWT_SECRET und andere Secrets für Produktion ändern
2. **Backup-Strategie**: Automatische Backups in Supabase aktivieren
3. **Monitoring**: Supabase Analytics und Logs überwachen
4. **Skalierung**: Bei Bedarf auf größere Supabase-Instanz upgraden

## 🎉 Fertig!

Deine App ist jetzt mit einer echten PostgreSQL-Datenbank verbunden und produktionsbereit!