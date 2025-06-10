import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const { requestPhoneVerification, isLoading, error, clearError } = useAuthStore();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  
  const handleContinue = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const success = await requestPhoneVerification(fullPhoneNumber);
    
    if (success) {
      router.push({
        pathname: '/phone-verification',
        params: { phone: fullPhoneNumber }
      });
    }
  };
  
  const handleLogin = () => {
    router.push('/login');
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login with Phone</Text>
      <Text style={styles.subtitle}>
        Enter your phone number to receive a verification code
      </Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={clearError}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </Pressable>
        </View>
      )}
      
      <View style={styles.phoneContainer}>
        <View style={styles.countryCodeContainer}>
          <TextInput
            style={styles.countryCodeInput}
            value={countryCode}
            onChangeText={setCountryCode}
            keyboardType="phone-pad"
          />
        </View>
        
        <TextInput
          style={styles.phoneInput}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Phone number"
          keyboardType="phone-pad"
        />
      </View>
      
      <Button
        title="Continue"
        onPress={handleContinue}
        loading={isLoading}
        style={styles.continueButton}
      />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Prefer to use email?</Text>
        <Pressable onPress={handleLogin}>
          <Text style={styles.loginText}>Login with Email</Text>
        </Pressable>
      </View>
      
      <Text style={styles.privacyText}>
        We'll send a verification code to this number. Standard message and data rates may apply.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 40,
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
    marginBottom: 32,
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
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  countryCodeContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginRight: 8,
  },
  countryCodeInput: {
    padding: 12,
    fontSize: 16,
    minWidth: 60,
    textAlign: 'center',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  continueButton: {
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    color: colors.textSecondary,
    marginRight: 4,
  },
  loginText: {
    color: colors.primary,
    fontWeight: '600',
  },
  privacyText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});