import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '@/constants/colors';

class PrivacyErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.log('Privacy (EN) page error', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container} testID="privacy-en-error">
          <View style={styles.content}>
            <Text style={styles.title}>Error</Text>
            <Text style={styles.paragraph}>There was a problem loading the Privacy Policy. Please try again.</Text>
          </View>
        </View>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

export default function PrivacyPolicyENScreen() {
  console.log('Render Privacy Policy (EN) for ZestApp');
  return (
    <PrivacyErrorBoundary>
      <ScrollView style={styles.container} testID="privacy-en-scroll">
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.title} testID="privacy-en-title">Privacy Policy for ZestApp</Text>
          <Text style={styles.lastUpdated} testID="privacy-en-updated">Last updated: September 12, 2025</Text>

          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            This Privacy Policy explains how ZestApp ("we", "us") collects, uses, stores, and protects your personal data when you use our
            app or website (zestapp.online). We are committed to protecting your privacy in accordance with the GDPR, the CCPA, and other
            applicable laws.
          </Text>

          <Text style={styles.sectionTitle}>What data do we collect?</Text>
          <Text style={styles.paragraph}>We collect the following personal data:</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Account information:</Text> Email address, phone number, and username for registration, login, and notifications.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Payment data:</Text> Information such as credit card or payment method details when purchasing in-app credits.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Location data:</Text> Your location to enable live events and comply with country-specific betting regulations.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Device data:</Text> Device type, operating system, IP address, and other technical data for app optimization and analytics.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Usage data:</Text> Information about your interactions with the app (e.g., clicks, created challenges, sent messages) to improve the app.</Text>

          <Text style={styles.sectionTitle}>Why do we collect this data?</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Providing the app:</Text> Account management, login, notifications, and chat features.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>In-app purchases:</Text> Processing purchases for credits via payment providers like Stripe.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Live events and betting:</Text> Location data to organize events and comply with country-specific betting rules.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Analytics and improvement:</Text> Device and usage data to optimize the app and fix issues.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Legal obligations:</Text> Compliance with legal requirements, e.g., in response to requests from authorities.</Text>

          <Text style={styles.sectionTitle}>How do we collect your data?</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Directly from you:</Text> When you create an account, purchase credits, or send messages.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Automatically:</Text> Location and device data are collected when you use the app.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>From third parties:</Text> Payment providers such as Stripe process payment data.</Text>

          <Text style={styles.sectionTitle}>Sharing your data</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Payment providers:</Text> Payment data is shared with trusted providers like Stripe to process purchases.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Legal obligations:</Text> When required by law (e.g., court order).</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Service providers:</Text> We use AWS for data storage and may use analytics tools like AWS Pinpoint that process anonymized data. We do not sell your data to third parties.</Text>

          <Text style={styles.sectionTitle}>International data transfers</Text>
          <Text style={styles.paragraph}>Your data is stored on AWS servers which may be located outside the EU/EEA (e.g., in the USA). We ensure such transfers are GDPR-compliant through standard contractual clauses or other safeguards.</Text>

          <Text style={styles.sectionTitle}>How do we protect your data?</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Technical measures:</Text> We use HTTPS for secure data transmission and encrypted AWS data storage.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Access restrictions:</Text> Only authorized personnel have access to your data.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Data minimization:</Text> We only collect the data necessary for app functionality.</Text>

          <Text style={styles.sectionTitle}>Your rights</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Access:</Text> Request access to your stored data.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Rectification:</Text> Correct inaccurate data.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Deletion:</Text> Delete your data (unless we are legally required to retain it).</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Objection:</Text> Object to processing for analytics or other non-essential purposes.</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Data portability:</Text> Receive your data in a structured format. Contact us at kontakt@zestapp.online or use the in-app function to delete/deactivate your account.</Text>

          <Text style={styles.sectionTitle}>Children</Text>
          <Text style={styles.paragraph}>ZestApp is intended for users aged 13 and older. We do not knowingly collect data from children under 13. If we become aware of such data, we will delete it promptly.</Text>

          <Text style={styles.sectionTitle}>Cookies and analytics tools</Text>
          <Text style={styles.paragraph}>Our website and app may use cookies or similar technologies to analyze usage.</Text>
          <Text style={styles.paragraph}>We may use AWS Pinpoint or similar tools for anonymized analytics. You can opt out of analytics (see "Your rights").</Text>

          <Text style={styles.sectionTitle}>Changes to this policy</Text>
          <Text style={styles.paragraph}>We may update this policy. Changes will be published at zestapp.online/privacy. For significant changes, we will notify you in the app or via email.</Text>

          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.paragraph}>Questions or requests regarding your data? Contact us: Email: kontakt@zestapp.online</Text>
        </View>
      </ScrollView>
    </PrivacyErrorBoundary>
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