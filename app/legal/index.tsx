import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import colors from '@/constants/colors';

interface LegalLinkProps {
  title: string;
  description: string;
  onPress: () => void;
}

export default function LegalIndexScreen() {
  const router = useRouter();
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Legal Information</Text>
        <Text style={styles.description}>
          Access important legal documents and information about ZestBet.
        </Text>
        
        <View style={styles.linksContainer}>
          <LegalLink 
            title="Terms and Conditions" 
            description="Our terms of service and user agreement"
            onPress={() => router.push('/legal/agb')}
          />
          
          <LegalLink 
            title="Privacy Policy" 
            description="How we collect, use, and protect your data"
            onPress={() => router.push('/legal/datenschutz')}
          />
          
          <LegalLink 
            title="Impressum" 
            description="Company information and contact details"
            onPress={() => router.push('/legal/impressum')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function LegalLink({ title, description, onPress }: LegalLinkProps) {
  return (
    <Pressable style={styles.linkItem} onPress={onPress}>
      <View style={styles.linkContent}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkDescription}>{description}</Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </Pressable>
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
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  linksContainer: {
    gap: 16,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});