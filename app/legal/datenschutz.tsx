import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '@/constants/colors';

class DatenschutzErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.log('Datenschutz page error', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container} testID="privacy-error">
          <View style={styles.content}>
            <Text style={styles.title}>Fehler</Text>
            <Text style={styles.paragraph}>Es gab ein Problem beim Laden der Datenschutzrichtlinie. Bitte versuche es erneut.</Text>
          </View>
        </View>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

export default function PrivacyPolicyScreen() {
  console.log('Render Datenschutzrichtlinie für ZestApp');
  return (
    <DatenschutzErrorBoundary>
      <ScrollView style={styles.container} testID="privacy-scroll">
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.title} testID="privacy-title">Datenschutzrichtlinie für ZestApp</Text>
          <Text style={styles.lastUpdated} testID="privacy-updated">Letzte Aktualisierung: 12. September 2025</Text>

          <Text style={styles.sectionTitle} testID="privacy-section-intro">Einleitung</Text>
          <Text style={styles.paragraph}>
            Diese Datenschutzrichtlinie beschreibt, wie ZestApp ("wir", "uns") deine personenbezogenen Daten sammelt, verwendet,
            speichert und schützt, wenn du unsere App oder Website (zestapp.online) nutzt. Wir verpflichten uns, deine Privatsphäre
            gemäß der Datenschutz-Grundverordnung (DSGVO), dem California Consumer Privacy Act (CCPA) und anderen geltenden Gesetzen zu schützen.
          </Text>

          <Text style={styles.sectionTitle}>Welche Daten sammeln wir?</Text>
          <Text style={styles.paragraph}>Wir sammeln die folgenden personenbezogenen Daten:</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Kontoinformationen:</Text> E-Mail-Adresse, Telefonnummer und Benutzername für Registrierung, Anmeldung und Benachrichtigungen.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Zahlungsdaten:</Text> Informationen wie Kreditkarten- oder Zahlungsmethodendaten beim Kauf von In-App-Credits.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Standortdaten:</Text> Dein Standort, um Live-Events zu ermöglichen und länderspezifische Vorschriften für Wetten einzuhalten.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Gerätedaten:</Text> Gerätetyp, Betriebssystem, IP-Adresse und andere technische Daten für App-Optimierung und Analysen.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Nutzungsdaten:</Text> Informationen über deine Interaktionen mit der App (z. B. Klicks, erstellte Challenges, gesendete Nachrichten), um die App zu verbessern.</Text>

          <Text style={styles.sectionTitle}>Warum sammeln wir diese Daten?</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Bereitstellung der App:</Text> Kontoverwaltung, Anmeldung, Benachrichtigungen und Chat-Funktionen.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>In-App-Käufe:</Text> Abwicklung von Käufen für Credits über Zahlungsanbieter wie Stripe.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Live-Events und Wetten:</Text> Standortdaten, um Events zu organisieren und länderspezifische Wettregeln einzuhalten.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Analyse und Verbesserung:</Text> Geräte- und Nutzungsdaten, um die App zu optimieren und Fehler zu beheben.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Rechtliche Verpflichtungen:</Text> Einhaltung gesetzlicher Vorschriften, z. B. bei Behördenanfragen.</Text>

          <Text style={styles.sectionTitle}>Wie sammeln wir deine Daten?</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Direkt von dir:</Text> Wenn du ein Konto erstellst, Credits kaufst oder Nachrichten sendest.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Automatisch:</Text> Standort- und Gerätedaten werden bei Nutzung der App erfasst.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Von Dritten:</Text> Zahlungsanbieter wie Stripe verarbeiten Zahlungsdaten.</Text>

          <Text style={styles.sectionTitle}>Weitergabe deiner Daten</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Zahlungsanbieter:</Text> Zahlungsdaten werden an vertrauenswürdige Anbieter wie Stripe weitergegeben, um Käufe abzuwickeln.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Rechtliche Verpflichtungen:</Text> Bei gesetzlicher Anforderung (z. B. Gerichtsbeschluss).</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Dienstleister:</Text> Wir nutzen AWS für Datenspeicherung und möglicherweise Analysetools wie AWS Pinpoint, die anonymisierte Daten verarbeiten. Wir verkaufen deine Daten nicht an Dritte.</Text>

          <Text style={styles.sectionTitle}>Internationale Datenübertragung</Text>
          <Text style={styles.paragraph}>Deine Daten werden auf AWS-Servern gespeichert, die sich möglicherweise außerhalb der EU/des EWR befinden (z. B. in den USA). Wir stellen sicher, dass solche Übertragungen DSGVO-konform sind, z. B. durch Standardvertragsklauseln oder andere Schutzmaßnahmen.</Text>

          <Text style={styles.sectionTitle}>Wie schützen wir deine Daten?</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Technische Maßnahmen:</Text> Wir verwenden HTTPS für sichere Datenübertragung und AWS-Datenspeicher mit Verschlüsselung.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Zugriffsbeschränkungen:</Text> Nur autorisiertes Personal hat Zugriff auf deine Daten.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Datensparsamkeit:</Text> Wir sammeln nur die Daten, die für die App-Funktionen nötig sind.</Text>

          <Text style={styles.sectionTitle}>Deine Rechte</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Auskunft:</Text> Einsicht in deine gespeicherten Daten.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Berichtigung:</Text> Korrektur falscher Daten.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Löschung:</Text> Löschung deiner Daten (sofern keine gesetzliche Aufbewahrungspflicht besteht).</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Widerspruch:</Text> Ablehnung der Datenverarbeitung für Analysen oder andere nicht zwingende Zwecke.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Datenübertragbarkeit:</Text> Erhalt deiner Daten in einem strukturierten Format. Kontaktiere uns unter kontakt@zestapp.online oder nutze die Funktion zum Löschen/Inaktivsetzen deines Kontos direkt in der App.</Text>

          <Text style={styles.sectionTitle}>Kinder</Text>
          <Text style={styles.paragraph}>ZestApp ist für Nutzer ab 13 Jahren gedacht. Wir sammeln wissentlich keine Daten von Kindern unter 13 Jahren. Wenn wir feststellen, dass solche Daten gesammelt wurden, löschen wir sie umgehend.</Text>

          <Text style={styles.sectionTitle}>Cookies und Analysetools</Text>
          <Text style={styles.paragraph}>Unsere Website und App können Cookies oder ähnliche Technologien verwenden, um die Nutzung zu analysieren.</Text>
          <Text style={styles.paragraph}>Wir nutzen möglicherweise AWS Pinpoint oder ähnliche Tools für anonymisierte Analysen. Du kannst der Nutzung für Analysen widersprechen (siehe „Deine Rechte“).</Text>

          <Text style={styles.sectionTitle}>Änderungen an dieser Richtlinie</Text>
          <Text style={styles.paragraph}>Wir können diese Richtlinie aktualisieren. Änderungen werden auf zestapp.online/privacy veröffentlicht. Bei wesentlichen Änderungen informieren wir dich in der App oder per E-Mail.</Text>

          <Text style={styles.sectionTitle}>Kontakt</Text>
          <Text style={styles.paragraph}>Fragen oder Anfragen zu deinen Daten? Schreib uns: E-Mail: kontakt@zestapp.online</Text>

          <Text style={styles.sectionTitle} testID="privacy-address-title">Verantwortliche Stelle / Postanschrift</Text>
          <Text style={styles.paragraph} testID="privacy-address-text">
            ZestApp / ZestBet Global GmbH{"\n"}
            Nordlicht 6{"\n"}
            31275 Lehrte{"\n"}
            Germany
          </Text>
        </View>
      </ScrollView>
    </DatenschutzErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  bold: {
    fontWeight: '600',
  },
});