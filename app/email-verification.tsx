import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  Alert,
  SafeAreaView
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function EmailVerificationScreen() {
  const router = useRouter();
  const { verifyEmail, isLoading, error, clearError, pendingVerification } = useAuthStore();
  
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  
  const email = pendingVerification?.email;
  
  useEffect(() => {
    if (!email) {
      router.replace('/register');
      return;
    }
  }, [email, router]);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const handleVerify = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }
    
    if (!email) {
      Alert.alert('Error', 'Email not found. Please try registering again.');
      return;
    }
    
    const success = await verifyEmail(email, code);
    
    if (success) {
      Alert.alert(
        'Email Verified!', 
        pendingVerification?.requiresPhoneVerification 
          ? 'Please verify your phone number to complete registration.'
          : 'Your account has been successfully verified! You can now log in.',
        [{
          text: 'Continue',
          onPress: () => {
            if (pendingVerification?.requiresPhoneVerification) {
              router.push('/phone-verification');
            } else {
              router.replace('/login');
            }
          }
        }]
      );
    }
  };
  
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    
    try {
      // In a real app, this would call an API to resend the code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCountdown(60);
      Alert.alert('Success', 'Verification code has been resent to your email');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  if (!email) {
    return null;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Email Verification' }} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification code to {email}. Please enter it below.
        </Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={clearError}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </Pressable>
          </View>
        )}
        
        <View style={styles.form}>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Enter 4-digit code"
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
          />
          
          <Button
            title="Verify Email"
            onPress={handleVerify}
            loading={isLoading}
            style={styles.verifyButton}
          />
          
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <Pressable 
              onPress={handleResendCode}
              disabled={countdown > 0 || isResending}
            >
              <Text 
                style={[
                  styles.resendButton, 
                  (countdown > 0 || isResending) && styles.resendButtonDisabled
                ]}
              >
                {isResending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </Text>
            </Pressable>
          </View>
        </View>
        
        <Button
          title="Back"
          onPress={handleBack}
          variant="outline"
          style={styles.backButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: `${colors.error}20`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    flex: 1,
  },
  dismissText: {
    color: colors.error,
    fontWeight: '600',
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 8,
  },
  verifyButton: {
    marginBottom: 16,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: colors.textSecondary,
    marginRight: 4,
  },
  resendButton: {
    color: colors.primary,
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: colors.textSecondary,
    opacity: 0.7,
  },
  backButton: {
    marginTop: 'auto',
  },
});