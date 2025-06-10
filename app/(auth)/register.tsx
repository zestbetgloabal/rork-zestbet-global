import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Eye, EyeOff, Check, Square } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError, loginWithGoogle, loginWithApple } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agbConsent, setAgbConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  
  const handleRegister = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    
    if (!email.trim() && !phone.trim()) {
      Alert.alert('Error', 'Please enter your email or phone number');
      return;
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (!agbConsent) {
      Alert.alert('Error', 'You must accept the Terms and Conditions');
      return;
    }
    
    if (!privacyConsent) {
      Alert.alert('Error', 'You must accept the Privacy Policy');
      return;
    }
    
    // If phone is provided, navigate to verification screen
    if (phone.trim()) {
      router.push({
        pathname: '/phone-verification',
        params: { 
          phone, 
          email, 
          username, 
          password,
          agbConsent: agbConsent ? 'true' : 'false',
          privacyConsent: privacyConsent ? 'true' : 'false'
        }
      });
      return;
    }
    
    // If email is provided, navigate to profile completion screen
    if (email.trim()) {
      router.push({
        pathname: '/profile-edit',
        params: {
          email,
          username,
          password,
          isNewUser: 'true',
          agbConsent: agbConsent ? 'true' : 'false',
          privacyConsent: privacyConsent ? 'true' : 'false'
        }
      });
      return;
    }
  };
  
  const handleLogin = () => {
    router.push('/login');
  };
  
  const handleGoogleLogin = async () => {
    try {
      const success = await loginWithGoogle();
      if (success) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Google Login Error', 'Failed to login with Google');
    }
  };
  
  const handleAppleLogin = async () => {
    try {
      const success = await loginWithApple();
      if (success) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Apple Login Error', 'Failed to login with Apple');
    }
  };
  
  const toggleAgbConsent = () => {
    setAgbConsent(!agbConsent);
  };
  
  const togglePrivacyConsent = () => {
    setPrivacyConsent(!privacyConsent);
  };
  
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join ZestBet and start your betting journey</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={clearError}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </Pressable>
        </View>
      )}
      
      {/* Social Login Options */}
      <View style={styles.socialLoginContainer}>
        <Text style={styles.socialLoginText}>Sign up with</Text>
        
        <View style={styles.socialButtonsRow}>
          <Pressable
            style={styles.socialButton}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.socialButtonLabel}>Google</Text>
          </Pressable>
          
          {Platform.OS === 'ios' && (
            <Pressable
              style={styles.socialButton}
              onPress={handleAppleLogin}
              disabled={isLoading}
            >
              <Text style={styles.appleIcon}>􀣺</Text>
              <Text style={styles.socialButtonLabel}>Apple</Text>
            </Pressable>
          )}
        </View>
        
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>
      </View>
      
      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Choose a username"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <Text style={styles.label}>Email or Phone Number</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <Text style={styles.orText}>or</Text>
        
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
        
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable 
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </Pressable>
        </View>
        
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        
        <Text style={styles.passwordRequirements}>
          Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
        </Text>
        
        {/* Consent Checkboxes */}
        <View style={styles.consentContainer}>
          <Pressable 
            style={styles.checkboxContainer} 
            onPress={toggleAgbConsent}
          >
            <View style={styles.checkbox}>
              {agbConsent ? (
                <Check size={16} color={colors.primary} />
              ) : (
                <Square size={16} color={colors.border} />
              )}
            </View>
            <View style={styles.checkboxTextContainer}>
              <Text style={styles.checkboxText}>
                I accept the 
                <Text 
                  style={styles.linkText}
                  onPress={() => router.push('/legal/agb')}
                > Terms and Conditions
                </Text>
              </Text>
            </View>
          </Pressable>
          
          <Pressable 
            style={styles.checkboxContainer} 
            onPress={togglePrivacyConsent}
          >
            <View style={styles.checkbox}>
              {privacyConsent ? (
                <Check size={16} color={colors.primary} />
              ) : (
                <Square size={16} color={colors.border} />
              )}
            </View>
            <View style={styles.checkboxTextContainer}>
              <Text style={styles.checkboxText}>
                I accept the 
                <Text 
                  style={styles.linkText}
                  onPress={() => router.push('/legal/datenschutz')}
                > Privacy Policy
                </Text>
              </Text>
            </View>
          </Pressable>
        </View>
        
        <Button
          title="Continue"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.registerButton}
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable onPress={handleLogin}>
          <Text style={styles.loginText}>Log In</Text>
        </Pressable>
      </View>
      
      <Text style={styles.termsText}>
        By creating an account, you agree to our 
        <Link href="/legal/agb" asChild>
          <Text style={styles.linkText}> Terms of Service </Text>
        </Link>
        and 
        <Link href="/legal/datenschutz" asChild>
          <Text style={styles.linkText}> Privacy Policy</Text>
        </Link>
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
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
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
  socialLoginContainer: {
    marginBottom: 24,
  },
  socialLoginText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 120,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    gap: 8,
  },
  socialButtonLabel: {
    fontSize: 14,
    color: colors.text,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  appleIcon: {
    fontSize: 24, // Increased size for better visibility
    fontWeight: 'bold',
    color: colors.text,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    color: colors.textSecondary,
    fontSize: 14,
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
    fontSize: 16,
    marginBottom: 16,
  },
  orText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  passwordRequirements: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  consentContainer: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 8,
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
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});