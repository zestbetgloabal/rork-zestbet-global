import React, { useRef, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const Button = React.memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  testID,
}: ButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, loading, onPress]);

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`${size}Size` as keyof typeof styles],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    styles[`${variant}Label` as keyof typeof styles],
    styles[`${size}Label` as keyof typeof styles],
    textStyle,
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        testID={testID}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'} size="small" />
        ) : (
          <>
            {icon}
            <Text style={labelStyle}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

Button.displayName = 'Button';

export default Button;

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    gap: 8,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  smallSize: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  mediumSize: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  largeSize: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 16,
  },
  label: {
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  primaryLabel: {
    color: '#000',
  },
  secondaryLabel: {
    color: colors.text,
  },
  outlineLabel: {
    color: colors.primary,
  },
  ghostLabel: {
    color: colors.primary,
  },
  dangerLabel: {
    color: '#fff',
  },
  smallLabel: {
    fontSize: 13,
  },
  mediumLabel: {
    fontSize: 15,
  },
  largeLabel: {
    fontSize: 17,
  },
});
