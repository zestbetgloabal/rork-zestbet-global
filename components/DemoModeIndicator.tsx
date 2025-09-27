import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import colors from '@/constants/colors';

interface DemoModeIndicatorProps {
  message?: string;
  style?: any;
  variant?: 'info' | 'success' | 'warning';
}

export default function DemoModeIndicator({ 
  message = "🎭 Production Demo - Fully functional with sample data",
  style,
  variant = 'info'
}: DemoModeIndicatorProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: `${colors.success}15`,
          borderColor: `${colors.success}40`,
          textColor: colors.success,
          iconColor: colors.success,
        };
      case 'warning':
        return {
          backgroundColor: `${colors.warning}15`,
          borderColor: `${colors.warning}40`,
          textColor: colors.warning,
          iconColor: colors.warning,
        };
      default:
        return {
          backgroundColor: `${colors.primary}15`,
          borderColor: `${colors.primary}40`,
          textColor: colors.primary,
          iconColor: colors.primary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[
      styles.container, 
      {
        backgroundColor: variantStyles.backgroundColor,
        borderColor: variantStyles.borderColor,
      },
      style
    ]}>
      <View style={styles.content}>
        <Sparkles size={16} color={variantStyles.iconColor} />
        <Text style={[styles.text, { color: variantStyles.textColor }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    flex: 1,
  },
});