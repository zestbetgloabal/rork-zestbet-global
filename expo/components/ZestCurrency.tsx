import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

interface ZestCurrencyProps {
  amount: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const ZestCurrency = React.memo(({ amount, size = 'medium', showLabel = false }: ZestCurrencyProps) => {
  const fontSize = size === 'small' ? 14 : size === 'large' ? 24 : 18;
  const emojiSize = size === 'small' ? 14 : size === 'large' ? 22 : 16;

  return (
    <View style={styles.container}>
      <Text style={[styles.emoji, { fontSize: emojiSize }]}>🪙</Text>
      <Text style={[styles.amount, { fontSize }]}>{amount.toLocaleString('de-DE')}</Text>
      {showLabel && <Text style={styles.label}>Zest</Text>}
    </View>
  );
});

ZestCurrency.displayName = 'ZestCurrency';

export default ZestCurrency;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 16,
  },
  amount: {
    color: colors.zest,
    fontWeight: '800' as const,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 2,
  },
});
