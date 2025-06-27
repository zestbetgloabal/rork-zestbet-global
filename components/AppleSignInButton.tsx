import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  View, 
  Platform,
  ActivityIndicator
} from 'react-native';

interface AppleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export default function AppleSignInButton({ 
  onPress, 
  loading = false, 
  disabled = false,
  style
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
          <View style={styles.iconContainer}>
            <Text style={styles.icon}></Text>
          </View>
          <Text style={styles.text}>Sign in with Apple</Text>
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
  },
  disabledButton: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});