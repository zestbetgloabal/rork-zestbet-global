import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '@/constants/colors';

export default function ImpressumScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Impressum</Text>

      <Text style={styles.heading}>Angaben gemäß § 5 TMG</Text>
      <Text style={styles.body}>
        ZestBet UG (haftungsbeschränkt){'\n'}
        Musterstraße 1{'\n'}
        10115 Berlin{'\n'}
        Deutschland
      </Text>

      <Text style={styles.heading}>Kontakt</Text>
      <Text style={styles.body}>
        E-Mail: kontakt@zestbet.app{'\n'}
        Telefon: +49 (0) 30 12345678
      </Text>

      <Text style={styles.heading}>Vertreten durch</Text>
      <Text style={styles.body}>Geschäftsführer: [Name einfügen]</Text>

      <Text style={styles.heading}>Registereintrag</Text>
      <Text style={styles.body}>
        Registergericht: Amtsgericht Berlin-Charlottenburg{'\n'}
        Registernummer: HRB [Nummer einfügen]
      </Text>

      <Text style={styles.heading}>Umsatzsteuer-ID</Text>
      <Text style={styles.body}>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:{'\n'}
        DE [Nummer einfügen]
      </Text>

      <Text style={styles.heading}>Verantwortlich für den Inhalt</Text>
      <Text style={styles.body}>
        [Name einfügen]{'\n'}
        Musterstraße 1{'\n'}
        10115 Berlin
      </Text>

      <Text style={styles.heading}>Streitschlichtung</Text>
      <Text style={styles.body}>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{'\n'}
        https://ec.europa.eu/consumers/odr{'\n\n'}
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </Text>

      <Text style={styles.heading}>Haftung für Inhalte</Text>
      <Text style={styles.body}>
        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
      </Text>
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
});
