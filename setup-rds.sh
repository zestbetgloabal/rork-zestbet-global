#!/bin/bash

# Schnelles AWS RDS Setup für PostgreSQL
# Erstellt eine kostengünstige RDS Instanz für ZestBet

set -e

echo "🗄️ AWS RDS PostgreSQL Setup"
echo "============================"

# Konfiguration
AWS_REGION="eu-central-1"
DB_IDENTIFIER="zestbet-db"
DB_NAME="zestbet"
DB_USERNAME="zestbet_admin"
DB_PASSWORD="ZestBet2024!$(date +%s | tail -c 4)"
DB_INSTANCE_CLASS="db.t3.micro"  # Kostenlos für 12 Monate
ALLOCATED_STORAGE="20"           # Minimum für PostgreSQL

echo "📋 RDS Konfiguration:"
echo "   Region: $AWS_REGION"
echo "   DB Identifier: $DB_IDENTIFIER"
echo "   DB Name: $DB_NAME"
echo "   Username: $DB_USERNAME"
echo "   Instance Class: $DB_INSTANCE_CLASS"
echo "   Storage: ${ALLOCATED_STORAGE}GB"
echo ""

# Prüfe ob DB bereits existiert
if aws rds describe-db-instances --db-instance-identifier $DB_IDENTIFIER --region $AWS_REGION &> /dev/null; then
    echo "⚠️ RDS Instanz '$DB_IDENTIFIER' existiert bereits"
    
    # Hole Endpoint
    DB_ENDPOINT=$(aws rds describe-db-instances \
        --db-instance-identifier $DB_IDENTIFIER \
        --region $AWS_REGION \
        --query 'DBInstances[0].Endpoint.Address' \
        --output text)
    
    if [ "$DB_ENDPOINT" != "None" ] && [ -n "$DB_ENDPOINT" ]; then
        echo "✅ DB Endpoint: $DB_ENDPOINT"
        
        # Aktualisiere .env.production
        if [ -f ".env.production" ]; then
            sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}:5432/${DB_NAME}|" .env.production
            echo "✅ .env.production aktualisiert"
        fi
        
        echo ""
        echo "🔗 Database URL:"
        echo "postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}:5432/${DB_NAME}"
    else
        echo "⏳ RDS Instanz wird noch erstellt..."
    fi
    
    exit 0
fi

echo "🚀 Erstelle RDS PostgreSQL Instanz..."

# Erstelle RDS Instanz
aws rds create-db-instance \
    --db-instance-identifier $DB_IDENTIFIER \
    --db-instance-class $DB_INSTANCE_CLASS \
    --engine postgres \
    --engine-version "15.4" \
    --master-username $DB_USERNAME \
    --master-user-password $DB_PASSWORD \
    --allocated-storage $ALLOCATED_STORAGE \
    --storage-type gp2 \
    --db-name $DB_NAME \
    --vpc-security-group-ids default \
    --publicly-accessible \
    --backup-retention-period 7 \
    --storage-encrypted \
    --region $AWS_REGION \
    --output table

echo ""
echo "✅ RDS Instanz wird erstellt..."
echo "⏳ Dies dauert normalerweise 10-15 Minuten"

# Warte auf Verfügbarkeit
echo ""
echo "⏳ Warte auf RDS Verfügbarkeit..."
echo "   (Sie können diesen Prozess mit Ctrl+C unterbrechen und später fortsetzen)"

# Polling für Status
TIMEOUT=1200  # 20 Minuten
ELAPSED=0
INTERVAL=30

while [ $ELAPSED -lt $TIMEOUT ]; do
    STATUS=$(aws rds describe-db-instances \
        --db-instance-identifier $DB_IDENTIFIER \
        --region $AWS_REGION \
        --query 'DBInstances[0].DBInstanceStatus' \
        --output text 2>/dev/null || echo "creating")
    
    echo "   Status: $STATUS (${ELAPSED}s elapsed)"
    
    if [ "$STATUS" = "available" ]; then
        echo "✅ RDS Instanz ist verfügbar!"
        break
    elif [ "$STATUS" = "failed" ]; then
        echo "❌ RDS Erstellung fehlgeschlagen"
        exit 1
    fi
    
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "⏰ Timeout erreicht. RDS wird möglicherweise noch erstellt."
    echo "   Prüfen Sie den Status mit: aws rds describe-db-instances --db-instance-identifier $DB_IDENTIFIER"
    exit 1
fi

# Hole DB Endpoint
DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier $DB_IDENTIFIER \
    --region $AWS_REGION \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

echo ""
echo "🎉 RDS Setup abgeschlossen!"
echo "=========================="
echo ""
echo "📍 Database Details:"
echo "   Endpoint: $DB_ENDPOINT"
echo "   Port: 5432"
echo "   Database: $DB_NAME"
echo "   Username: $DB_USERNAME"
echo "   Password: $DB_PASSWORD"
echo ""
echo "🔗 Connection String:"
echo "postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}:5432/${DB_NAME}"

# Aktualisiere .env.production
if [ -f ".env.production" ]; then
    sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}:5432/${DB_NAME}|" .env.production
    echo ""
    echo "✅ .env.production aktualisiert"
fi

# Speichere DB Credentials
cat > .db-credentials << EOF
# RDS Database Credentials
# WICHTIG: Diese Datei nicht in Git committen!

DB_ENDPOINT=$DB_ENDPOINT
DB_NAME=$DB_NAME
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD
DATABASE_URL=postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}:5432/${DB_NAME}
EOF

echo "✅ DB Credentials gespeichert in .db-credentials"

echo ""
echo "📋 Nächste Schritte:"
echo "1. Führen Sie Datenbank Migrationen aus:"
echo "   npm run db:migrate"
echo ""
echo "2. Testen Sie die Verbindung:"
echo "   psql postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}:5432/${DB_NAME}"
echo ""
echo "3. Aktualisieren Sie Lambda Environment Variables:"
echo "   aws lambda update-function-configuration --function-name zestbet-backend --environment Variables='{DATABASE_URL=postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}:5432/${DB_NAME}}'"

echo ""
echo "💰 Kosten-Hinweis:"
echo "   db.t3.micro ist 12 Monate kostenlos für neue AWS Accounts"
echo "   Danach ca. 15-20€/Monat"

echo ""
echo "🏁 RDS Setup abgeschlossen!"