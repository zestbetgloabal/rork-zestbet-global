import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { Facebook } from 'lucide-react-native';
import colors from '@/constants/colors';

interface FacebookSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}

export default function FacebookSignInButton({ 
  onPress, 
  loading = false, 
  disabled = false,
  style,
  textStyle
}: FacebookSignInButtonProps) {
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
          <Facebook size={20} color="#fff" />
          <Text style={[styles.text, textStyle]}>Facebook</Text>
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
    backgroundColor: '#1877F2',
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
    fontSize: 14,
    fontWeight: '600',
  },
});