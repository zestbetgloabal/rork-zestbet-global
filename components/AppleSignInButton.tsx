import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  View, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { Apple } from 'lucide-react-native';

interface AppleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}

export default function AppleSignInButton({ 
  onPress, 
  loading = false, 
  disabled = false,
  style,
  textStyle
}: AppleSignInButtonProps) {
  // Only render on iOS
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <Pressable
      style={[styles.button, disabled && styles.disabledButton, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Apple size={20} color="#fff" />
          <Text style={[styles.text, textStyle]}>Sign in with Apple</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    minWidth: 200,
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
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});