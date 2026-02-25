import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '@/constants/colors';

export default function DatenschutzScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Datenschutzerklärung</Text>

      <Text style={styles.heading}>1. Verantwortliche Stelle</Text>
      <Text style={styles.body}>
        ZestBet UG (haftungsbeschränkt){'\n'}
        Musterstraße 1, 10115 Berlin{'\n'}
        kontakt@zestbet.app
      </Text>

      <Text style={styles.heading}>2. Erhobene Daten</Text>
      <Text style={styles.body}>
        Wir erheben und verarbeiten folgende personenbezogene Daten:{'\n\n'}
        • E-Mail-Adresse (für Registrierung und Login){'\n'}
        • Benutzername und Profilbild{'\n'}
        • Wett-Aktivitäten und Zest-Coins-Transaktionen{'\n'}
        • Geräteinformationen und IP-Adressen
      </Text>

      <Text style={styles.heading}>3. Zweck der Datenverarbeitung</Text>
      <Text style={styles.body}>
        • Bereitstellung und Verbesserung unserer Dienste{'\n'}
        • Authentifizierung und Kontosicherheit{'\n'}
        • Abwicklung von Wetten und Transaktionen{'\n'}
        • Push-Benachrichtigungen (mit Einwilligung){'\n'}
        • Charity-Tracking und Transparenz
      </Text>

      <Text style={styles.heading}>4. Rechtsgrundlage</Text>
      <Text style={styles.body}>
        Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. a (Einwilligung), lit. b (Vertragserfüllung) und lit. f (berechtigtes Interesse) der DSGVO.
      </Text>

      <Text style={styles.heading}>5. Datenweitergabe</Text>
      <Text style={styles.body}>
        Wir geben Ihre Daten nicht an Dritte weiter, es sei denn, dies ist zur Vertragserfüllung erforderlich (z.B. Zahlungsdienstleister) oder gesetzlich vorgeschrieben.
      </Text>

      <Text style={styles.heading}>6. Speicherdauer</Text>
      <Text style={styles.body}>
        Personenbezogene Daten werden gelöscht, sobald der Zweck der Speicherung entfällt oder Sie die Löschung beantragen. Gesetzliche Aufbewahrungsfristen bleiben unberührt.
      </Text>

      <Text style={styles.heading}>7. Ihre Rechte (DSGVO)</Text>
      <Text style={styles.body}>
        Sie haben das Recht auf:{'\n\n'}
        • Auskunft (Art. 15 DSGVO){'\n'}
        • Berichtigung (Art. 16 DSGVO){'\n'}
        • Löschung (Art. 17 DSGVO){'\n'}
        • Einschränkung der Verarbeitung (Art. 18 DSGVO){'\n'}
        • Datenübertragbarkeit (Art. 20 DSGVO){'\n'}
        • Widerspruch (Art. 21 DSGVO){'\n\n'}
        Kontaktieren Sie uns unter kontakt@zestbet.app.
      </Text>

      <Text style={styles.heading}>8. Cookies und Tracking</Text>
      <Text style={styles.body}>
        Die App verwendet keine Cookies. Für die Funktionalität werden lokale Speichermechanismen des Geräts genutzt (AsyncStorage).
      </Text>

      <Text style={styles.heading}>9. Sicherheit</Text>
      <Text style={styles.body}>
        Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten zu schützen. Die Kommunikation erfolgt verschlüsselt über HTTPS/SSL.
      </Text>

      <Text style={styles.footer}>Stand: Februar 2026</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: colors.text,
    marginBottom: 20,
    marginTop: 8,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    textAlign: 'center' as const,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 32,
    fontStyle: 'italic' as const,
  },
});
