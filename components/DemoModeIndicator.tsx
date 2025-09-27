import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

interface DemoModeIndicatorProps {
  message?: string;
  style?: any;
}

export default function DemoModeIndicator({ 
  message = "🎭 Demo Mode - Showing sample data",
  style 
}: DemoModeIndicatorProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${colors.primary}10`,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  text: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});