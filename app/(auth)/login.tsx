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
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import AppleSignInButton from '@/components/AppleSignInButton';
import FacebookSignInButton from '@/components/FacebookSignInButton';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import colors from '@/constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError, loginWithGoogle, loginWithApple, loginWithFacebook } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    
    const success = await login(email, password);
    if (success) {
      router.replace('/(tabs)');
    }
  };
  
  const handleForgotPassword = () => {
    // In a real app, this would navigate to a forgot password screen
    Alert.alert('Forgot Password', 'A password reset link has been sent to your email.');
  };
  
  const handleCreateAccount = () => {
    router.push('/register');
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
  
  const handleFacebookLogin = async () => {
    try {
      const success = await loginWithFacebook();
      if (success) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Facebook Login Error', 'Failed to login with Facebook');
    }
  };
  
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Log in to continue your betting journey</Text>
      
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
        <Text style={styles.socialLoginText}>Log in with</Text>
        
        <View style={styles.socialButtonsRow}>
          <GoogleSignInButton
            onPress={handleGoogleLogin}
            loading={isLoading}
            disabled={isLoading}
          />
          
          <FacebookSignInButton
            onPress={handleFacebookLogin}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
        
        {Platform.OS === 'ios' && (
          <AppleSignInButton
            onPress={handleAppleLogin}
            loading={isLoading}
            style={styles.appleButton}
          />
        )}
        
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>
      </View>
      
      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
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
        
        <Pressable onPress={handleForgotPassword}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </Pressable>
        
        <Button
          title="Log In"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.loginButton}
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Pressable onPress={handleCreateAccount}>
          <Text style={styles.createAccountText}>Create Account</Text>
        </Pressable>
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
    marginBottom: 16,
  },
  appleButton: {
    width: '100%',
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 32,
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
  forgotPassword: {
    color: colors.primary,
    textAlign: 'right',
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    marginRight: 4,
  },
  createAccountText: {
    color: colors.primary,
    fontWeight: '600',
  },
});