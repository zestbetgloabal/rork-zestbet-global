import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Pressable } from 'react-native';
import { Mail, Phone, MapPin } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function ImpressumScreen() {
  const handleEmailPress = () => {
    Linking.openURL('mailto:zestbetglobal@gmail.com');
  };
  
  const handlePhonePress = () => {
    Linking.openURL('tel:015164055107');
  };
  
  const handleMapPress = () => {
    Linking.openURL('https://maps.google.com/?q=Nordlicht+6,+31275+Lehrte,+Germany');
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Impressum</Text>
        <Text style={styles.subtitle}>Company Information</Text>
        

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Managing Directors</Text>
          <Text style={styles.paragraph}>
            Erhan Berse
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <Pressable style={styles.contactItem} onPress={handleMapPress}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.contactText}>
              Nordlicht 6{'\n'}
              31275 Lehrte{'\n'}
              Germany
            </Text>
          </Pressable>
          
          <Pressable style={styles.contactItem} onPress={handleEmailPress}>
            <Mail size={20} color={colors.primary} />
            <Text style={styles.contactText}>
              zestbetglobal@gmail.com
            </Text>
          </Pressable>
          
          <Pressable style={styles.contactItem} onPress={handlePhonePress}>
            <Phone size={20} color={colors.primary} />
            <Text style={styles.contactText}>
              015164055107
            </Text>
          </Pressable>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Responsible for Content</Text>
          <Text style={styles.paragraph}>
            According to § 55 Abs. 2 RStV:
          </Text>
          <Text style={styles.paragraph}>
            Erhan Berse{'\n'}
            Nordlicht 6{'\n'}
            31275 Lehrte{'\n'}
            Germany
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dispute Resolution</Text>
          <Text style={styles.paragraph}>
            The European Commission provides a platform for online dispute resolution (OS) which is available at https://ec.europa.eu/consumers/odr/.
          </Text>
          <Text style={styles.paragraph}>
            We are not obliged and not willing to participate in dispute resolution proceedings before a consumer arbitration board.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liability for Content</Text>
          <Text style={styles.paragraph}>
            As a service provider, we are responsible for our own content on these pages according to § 7 Abs.1 TMG. However, according to §§ 8 to 10 TMG, we are not obliged to monitor transmitted or stored information or to investigate circumstances that indicate illegal activity.
          </Text>
        </View>
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
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    lineHeight: 24,
  },
});