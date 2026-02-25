import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Copy, Share2, MessageCircle, Link2, Users, Gift } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import { useUserStore } from '@/store/userStore';

export default function InviteScreen() {
  const { user } = useUserStore();
  const inviteCode = user?.inviteCode ?? 'ZEST-XXXXX';
  const inviteLink = `https://zestbet.app/join/${inviteCode}`;

  const handleCopy = useCallback(async (text: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Kopiert! ✅', 'In die Zwischenablage kopiert.');
  }, []);

  const handleShare = useCallback(async () => {
    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(inviteLink);
      Alert.alert('Link kopiert!', 'Teile ihn mit deinen Freunden.');
      return;
    }
    try {
      const { Share } = require('react-native');
      await Share.share({
        message: `Hey! Komm zu ZestBet und wette mit mir! 🎯\n\nMein Einladungscode: ${inviteCode}\n\n${inviteLink}`,
      });
    } catch (e) {
      console.warn('Share failed:', e);
    }
  }, [inviteCode, inviteLink]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Freunde einladen' }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🤝</Text>
          <Text style={styles.heroTitle}>Freunde einladen</Text>
          <Text style={styles.heroSub}>
            Lade deine Freunde ein und ihr bekommt beide{'\n'}
            <Text style={styles.bonusHighlight}>50 Bonus Zest-Coins! 🪙</Text>
          </Text>
        </View>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Dein Einladungscode</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{inviteCode}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={() => handleCopy(inviteCode)}>
              <Copy size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.linkCard}>
          <Text style={styles.codeLabel}>Einladungslink</Text>
          <View style={styles.codeRow}>
            <Text style={styles.linkText} numberOfLines={1}>{inviteLink}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={() => handleCopy(inviteLink)}>
              <Copy size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="Link teilen"
          onPress={handleShare}
          size="large"
          icon={<Share2 size={18} color="#000" />}
        />

        <View style={styles.methodsSection}>
          <Text style={styles.methodsTitle}>Einladungsmethoden</Text>
          <View style={styles.methodsGrid}>
            <TouchableOpacity style={styles.methodCard} onPress={handleShare}>
              <MessageCircle size={22} color={colors.accent} />
              <Text style={styles.methodLabel}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.methodCard} onPress={handleShare}>
              <Link2 size={22} color={colors.primary} />
              <Text style={styles.methodLabel}>Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.methodCard} onPress={handleShare}>
              <Users size={22} color={colors.charity} />
              <Text style={styles.methodLabel}>Kontakte</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.howItWorks}>
          <Text style={styles.howTitle}>So funktioniert's</Text>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Teile deinen Code oder Link mit Freunden</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Dein Freund registriert sich mit dem Code</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Ihr bekommt beide 50 Bonus Zest-Coins! 🎉</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  heroEmoji: {
    fontSize: 56,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: colors.text,
  },
  heroSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  bonusHighlight: {
    color: colors.zest,
    fontWeight: '700' as const,
  },
  codeCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  linkCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  codeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: colors.primary,
    letterSpacing: 2,
  },
  linkText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodsSection: {
    gap: 12,
    marginTop: 8,
  },
  methodsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  methodsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  methodCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  howItWorks: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  howTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    lineHeight: 28,
  },
  stepText: {
    color: colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
});
