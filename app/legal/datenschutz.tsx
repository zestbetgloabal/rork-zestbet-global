import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '@/constants/colors';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: June 1, 2025</Text>
        
        <Text style={styles.paragraph}>
          This Privacy Policy describes how ZestBet collects, uses, and shares your personal information when you use our mobile application and services.
        </Text>
        
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect the following types of information:
        </Text>
        <Text style={styles.paragraph}>
          1.1. <Text style={styles.bold}>Personal Information:</Text> When you create an account, we collect your username, email address, and optionally your phone number and profile picture.
        </Text>
        <Text style={styles.paragraph}>
          1.2. <Text style={styles.bold}>Usage Information:</Text> We collect information about how you use our app, including your betting history, interactions with other users, and app features you use.
        </Text>
        <Text style={styles.paragraph}>
          1.3. <Text style={styles.bold}>Device Information:</Text> We collect information about your device, including device type, operating system, and unique device identifiers.
        </Text>
        
        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use your information for the following purposes:
        </Text>
        <Text style={styles.paragraph}>
          2.1. To provide and maintain our services.
        </Text>
        <Text style={styles.paragraph}>
          2.2. To process your bets and track your virtual currency balance.
        </Text>
        <Text style={styles.paragraph}>
          2.3. To communicate with you about your account and our services.
        </Text>
        <Text style={styles.paragraph}>
          2.4. To improve our app and develop new features.
        </Text>
        <Text style={styles.paragraph}>
          2.5. To prevent fraud and ensure compliance with our Terms and Conditions.
        </Text>
        
        <Text style={styles.sectionTitle}>3. Sharing Your Information</Text>
        <Text style={styles.paragraph}>
          We may share your information in the following circumstances:
        </Text>
        <Text style={styles.paragraph}>
          3.1. <Text style={styles.bold}>With Other Users:</Text> Your username, profile picture, and betting activity may be visible to other users on the platform.
        </Text>
        <Text style={styles.paragraph}>
          3.2. <Text style={styles.bold}>With Service Providers:</Text> We may share your information with third-party service providers who help us operate our app and provide our services.
        </Text>
        <Text style={styles.paragraph}>
          3.3. <Text style={styles.bold}>For Legal Reasons:</Text> We may share your information if required by law or to protect our rights and the safety of our users.
        </Text>
        
        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction.
        </Text>
        
        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          Depending on your location, you may have certain rights regarding your personal information, including:
        </Text>
        <Text style={styles.paragraph}>
          5.1. The right to access and receive a copy of your personal information.
        </Text>
        <Text style={styles.paragraph}>
          5.2. The right to correct inaccurate or incomplete information.
        </Text>
        <Text style={styles.paragraph}>
          5.3. The right to request deletion of your personal information.
        </Text>
        <Text style={styles.paragraph}>
          5.4. The right to restrict or object to processing of your personal information.
        </Text>
        
        <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18.
        </Text>
        
        <Text style={styles.sectionTitle}>7. Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </Text>
        
        <Text style={styles.sectionTitle}>8. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us at privacy@zestbet.com.
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
  bold: {
    fontWeight: '600',
  },
});