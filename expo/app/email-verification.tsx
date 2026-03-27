import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Mail, CheckCircle } from 'lucide-react-native';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';

export default function EmailVerificationScreen() {
  const router = useRouter();
  const { verifyEmail, isLoading, error, clearError, pendingEmail } = useAuthStore();
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleVerify = useCallback(async () => {
    clearError();
    const success = await verifyEmail(code);
    if (success) {
      setVerified(true);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
    }
  }, [code, verifyEmail, clearError, router]);

  if (verified) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Verifizierung', headerShown: false }} />
        <View style={styles.successContainer}>
          <CheckCircle size={64} color={colors.success} />
          <Text style={styles.successTitle}>E-Mail bestätigt!</Text>
          <Text style={styles.successSub}>Willkommen bei ZestBet 🎯</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Verifizierung', headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Mail size={32} color={colors.primary} />
          </View>

          <Text style={styles.title}>E-Mail bestätigen</Text>
          <Text style={styles.subtitle}>
            Wir haben einen 6-stelligen Code an{'\n'}
            <Text style={styles.emailHighlight}>{pendingEmail ?? 'deine E-Mail'}</Text>
            {' '}gesendet.
          </Text>

          <Text style={styles.devHint}>
            💡 Dev-Modus: Schau in die Konsole für den Code
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TextInput
            ref={inputRef}
            style={styles.codeInput}
            placeholder="000000"
            placeholderTextColor={colors.textMuted}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
            autoFocus
            testID="verify-code"
          />

          <Button
            title="Bestätigen"
            onPress={handleVerify}
            loading={isLoading}
            disabled={code.length !== 6}
            size="large"
            testID="verify-submit"
          />

          <Button
            title="Zurück zum Login"
            onPress={() => router.back()}
            variant="ghost"
            testID="verify-back"
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: colors.text,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  emailHighlight: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  devHint: {
    fontSize: 12,
    color: colors.warning,
    textAlign: 'center' as const,
    backgroundColor: colors.warning + '10',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  errorBox: {
    backgroundColor: colors.error + '15',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center' as const,
  },
  codeInput: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: colors.success,
  },
  successSub: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
