import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '@/constants/colors';

class TermsErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    if (__DEV__) {
      console.log('AGB page error', error);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container} testID="agb-error">
          <View style={styles.content}>
            <Text style={styles.title}>Fehler</Text>
            <Text style={styles.paragraph}>Die AGB konnten nicht geladen werden. Bitte versuche es erneut.</Text>
          </View>
        </View>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

export default function TermsScreen() {
  if (__DEV__) {
    console.log('Render AGB (DE) for ZestApp');
  }
  return (
    <TermsErrorBoundary>
      <ScrollView style={styles.container} testID="agb-scroll">
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.title} testID="agb-title">Allgemeine Geschäftsbedingungen (AGB)</Text>
          <Text style={styles.lastUpdated} testID="agb-updated">Letzte Aktualisierung: 12. September 2025</Text>

          <Text style={styles.sectionTitle}>1. Geltungsbereich und Zustimmung</Text>
          <Text style={styles.paragraph}>
            Durch den Zugriff auf oder die Nutzung von ZestApp erklärst du dich mit diesen Allgemeinen Geschäftsbedingungen einverstanden. Wenn du den Bedingungen nicht zustimmst, darfst du unsere Dienste nicht nutzen.
          </Text>

          <Text style={styles.sectionTitle}>2. Leistungsbeschreibung</Text>
          <Text style={styles.paragraph}>
            ZestApp ist eine soziale Wett- und Challenge-Plattform, auf der Nutzer Wetten und Herausforderungen zu verschiedenen Ereignissen erstellen und daran teilnehmen können. Ein Teil der Aktivitäten kann wohltätige Zwecke unterstützen.
          </Text>

          <Text style={styles.sectionTitle}>3. Nutzerkonto</Text>
          <Text style={styles.paragraph}>
            Für bestimmte Funktionen ist eine Registrierung erforderlich. Du bist dafür verantwortlich, deine Zugangsdaten vertraulich zu behandeln und für alle Aktivitäten in deinem Konto.
          </Text>

          <Text style={styles.sectionTitle}>4. Wett- und Challenge-Regeln</Text>
          <Text style={styles.paragraph}>4.1. Platzierte Wetten/Challenges sind grundsätzlich verbindlich und können nicht storniert oder erstattet werden.</Text>
          <Text style={styles.paragraph}>4.2. ZestApp behält sich vor, Wetten/Challenges bei technischen Fehlern, Betrug oder Manipulation zu annullieren.</Text>
          <Text style={styles.paragraph}>4.3. Nutzer müssen mindestens 18 Jahre alt sein, sofern nicht höhere Altersgrenzen nach lokalem Recht gelten.</Text>

          <Text style={styles.sectionTitle}>5. Virtuelle Währung</Text>
          <Text style={styles.paragraph}>5.1. Auf der Plattform wird eine virtuelle Währung namens „Zest“ verwendet.</Text>
          <Text style={styles.paragraph}>5.2. „Zest“ hat keinen realen Geldwert und kann nicht in echtes Geld umgetauscht werden.</Text>
          <Text style={styles.paragraph}>5.3. Nutzer erhalten ggf. tägliche kostenlose Zest und können zusätzliche Zest erwerben.</Text>

          <Text style={styles.sectionTitle}>6. Wohltätige Beiträge</Text>
          <Text style={styles.paragraph}>6.1. Ein Teil der Aktivitäten kann wohltätigen Organisationen zugutekommen.</Text>
          <Text style={styles.paragraph}>6.2. ZestApp wählt die begünstigten Organisationen aus und bestimmt die Beitragshöhe.</Text>

          <Text style={styles.sectionTitle}>7. Verbotene Aktivitäten</Text>
          <Text style={styles.paragraph}>Untersagt sind u. a.:</Text>
          <Text style={styles.paragraph}>7.1. Mehrfachkonten zur Erlangung zusätzlicher Gratis-Zest.</Text>
          <Text style={styles.paragraph}>7.2. Einsatz automatisierter Systeme oder Bots.</Text>
          <Text style={styles.paragraph}>7.3. Manipulation von Ereignissen oder Ergebnissen.</Text>

          <Text style={styles.sectionTitle}>8. Kündigung und Sperrung</Text>
          <Text style={styles.paragraph}>
            ZestApp kann Konten jederzeit sperren oder kündigen, insbesondere bei Verstößen gegen diese AGB oder wenn die Integrität der Plattform gefährdet ist.
          </Text>

          <Text style={styles.sectionTitle}>9. Änderungen der AGB</Text>
          <Text style={styles.paragraph}>
            ZestApp kann diese AGB jederzeit ändern. Die fortgesetzte Nutzung nach Änderungen gilt als Zustimmung zu den aktualisierten AGB.
          </Text>

          <Text style={styles.sectionTitle}>10. Kontakt</Text>
          <Text style={styles.paragraph}>Bei Fragen zu diesen AGB: kontakt@zestapp.online</Text>
        </View>
      </ScrollView>
    </TermsErrorBoundary>
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
});