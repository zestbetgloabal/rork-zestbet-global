import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '@/constants/colors';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <Text style={styles.lastUpdated}>Last updated: June 1, 2025</Text>
        
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using ZestBet, you agree to be bound by these Terms and Conditions. If you do not agree to all the terms and conditions, you may not access or use our services.
        </Text>
        
        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          ZestBet is a social betting platform that allows users to place bets on various events and outcomes. A portion of all bets is contributed to charitable causes selected by the platform.
        </Text>
        
        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          To use certain features of ZestBet, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
        </Text>
        
        <Text style={styles.sectionTitle}>4. Betting Rules</Text>
        <Text style={styles.paragraph}>
          4.1. All bets are final once placed and cannot be canceled or refunded.
        </Text>
        <Text style={styles.paragraph}>
          4.2. ZestBet reserves the right to void any bet in case of technical errors, fraud, or other circumstances that compromise the integrity of the betting process.
        </Text>
        <Text style={styles.paragraph}>
          4.3. Users must be at least 18 years old to place bets on the platform.
        </Text>
        
        <Text style={styles.sectionTitle}>5. Virtual Currency</Text>
        <Text style={styles.paragraph}>
          5.1. ZestBet uses a virtual currency called "Zest" for all betting activities on the platform.
        </Text>
        <Text style={styles.paragraph}>
          5.2. Zest has no real-world monetary value and cannot be exchanged for real money.
        </Text>
        <Text style={styles.paragraph}>
          5.3. Users receive a daily allocation of free Zest and can purchase additional Zest through the platform.
        </Text>
        
        <Text style={styles.sectionTitle}>6. Charitable Contributions</Text>
        <Text style={styles.paragraph}>
          6.1. A portion of all bets placed on ZestBet is contributed to charitable causes.
        </Text>
        <Text style={styles.paragraph}>
          6.2. ZestBet selects the charitable organizations that receive contributions and determines the amount of each contribution.
        </Text>
        
        <Text style={styles.sectionTitle}>7. Prohibited Activities</Text>
        <Text style={styles.paragraph}>
          Users are prohibited from engaging in any illegal or fraudulent activities on the platform, including but not limited to:
        </Text>
        <Text style={styles.paragraph}>
          7.1. Creating multiple accounts to receive additional free Zest.
        </Text>
        <Text style={styles.paragraph}>
          7.2. Using automated systems or bots to place bets.
        </Text>
        <Text style={styles.paragraph}>
          7.3. Manipulating the outcome of events on which bets are placed.
        </Text>
        
        <Text style={styles.sectionTitle}>8. Termination</Text>
        <Text style={styles.paragraph}>
          ZestBet reserves the right to terminate or suspend any user account at any time for violation of these Terms and Conditions or for any other reason at our sole discretion.
        </Text>
        
        <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          ZestBet may modify these Terms and Conditions at any time. Continued use of the platform after any such changes constitutes your acceptance of the new Terms and Conditions.
        </Text>
        
        <Text style={styles.sectionTitle}>10. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms and Conditions, please contact us at support@zestbet.com.
        </Text>
      </View>
    </ScrollView>
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