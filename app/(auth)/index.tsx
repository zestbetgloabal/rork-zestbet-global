import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  SafeAreaView,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  Platform
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { isLoading, loginWithApple, loginWithGoogle } = useAuthStore();
  
  const handleEmailLogin = () => {
    router.push('/login');
  };
  
  const handleCreateAccount = () => {
    router.push('/register');
  };
  
  const handleAppleLogin = async () => {
    try {
      const success = await loginWithApple();
      if (success) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Apple Login Error', error);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      const success = await loginWithGoogle();
      if (success) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Google Login Error', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'rgba(249, 115, 22, 0.1)']}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoSymbol}>Ƶ</Text>
          </View>
          <Text style={styles.logoText}>Ƶest</Text>
        </View>
        
        <Text style={styles.title}>Welcome to ZestBet</Text>
        <Text style={styles.subtitle}>
          The Social Betting Platform: Bet with Friends, Support Charity
        </Text>
        
        <View style={styles.authButtonsContainer}>
          <Button 
            title="Create Account" 
            onPress={handleCreateAccount}
            variant="primary"
            disabled={isLoading}
          />
          
          <Button 
            title="Log In" 
            onPress={handleEmailLogin}
            variant="outline"
            disabled={isLoading}
            style={styles.loginButton}
          />
          
          {Platform.OS === 'ios' && (
            <Pressable
              style={styles.appleButton}
              onPress={handleAppleLogin}
              disabled={isLoading}
            >
              <View style={styles.appleIconContainer}>
                <Text style={styles.appleIcon}>
                </Text>
              </View>
              <Text style={styles.appleButtonText}>Sign in with Apple</Text>
            </Pressable>
          )}
        </View>
        
        <View style={styles.legalLinks}>
          <Link href="/legal/impressum" asChild>
            <Text style={styles.legalLink}>Impressum</Text>
          </Link>
          <Text style={styles.legalSeparator}>•</Text>
          <Link href="/legal/agb" asChild>
            <Text style={styles.legalLink}>Terms</Text>
          </Link>
          <Text style={styles.legalSeparator}>•</Text>
          <Link href="/legal/datenschutz" asChild>
            <Text style={styles.legalLink}>Privacy</Text>
          </Link>
        </View>
        
        <Text style={styles.termsText}>
          By continuing, you agree to our 
          <Link href="/legal/agb" asChild>
            <Text style={styles.linkText}> Terms of Service </Text>
          </Link>
          and 
          <Link href="/legal/datenschutz" asChild>
            <Text style={styles.linkText}> Privacy Policy</Text>
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}

// Simple Button component for this screen
function Button({ title, onPress, variant = 'primary', disabled = false, style = {} }: ButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.outlineButton,
        disabled && styles.disabledButton,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text 
        style={[
          styles.buttonText,
          variant === 'primary' ? styles.primaryButtonText : styles.outlineButtonText,
          disabled && styles.disabledButtonText
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    paddingTop: 64, // Added padding to move content down by approximately 1cm
  },
  logoContainer: {
    marginTop: 50,
    alignItems: 'center',
    width: 130, // Increased by 30% from 100
    height: 130, // Increased by 30% from 100
  },
  logoCircle: {
    width: 91, // Increased by 30% from 70
    height: 91, // Increased by 30% from 70
    borderRadius: 45.5, // Half of the new width/height
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoSymbol: {
    fontSize: 52, // Increased by 30% from 40
    fontWeight: 'bold',
    color: '#000',
  },
  logoText: {
    marginTop: 8,
    fontSize: 31, // Increased by 30% from 24
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  authButtonsContainer: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: 'white',
  },
  outlineButtonText: {
    color: colors.primary,
  },
  disabledButtonText: {
    opacity: 0.8,
  },
  loginButton: {
    marginTop: 12,
    marginBottom: 12,
  },
  // Apple button styles following Apple's design guidelines
  appleButton: {
    height: 50,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginTop: 12,
  },
  appleIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  appleIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 16,
  },
  legalLink: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: 8,
  },
  legalSeparator: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  linkText: {
    color: colors.primary,
  },
});