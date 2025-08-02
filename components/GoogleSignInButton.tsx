import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View
} from 'react-native';
import colors from '@/constants/colors';

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}

export default function GoogleSignInButton({ 
  onPress, 
  loading = false, 
  disabled = false,
  style,
  textStyle
}: GoogleSignInButtonProps) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.disabledButton, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <>
          <View style={styles.googleIcon}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={[styles.text, textStyle]}>Google</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 120,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  text: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});