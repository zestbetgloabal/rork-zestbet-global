import React from 'react';
import { Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

interface ZestCurrencyProps {
  amount: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function ZestCurrency({ amount, size = 'medium', color }: ZestCurrencyProps) {
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 20;
      default:
        return 16;
    }
  };
  
  const getSymbolSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 14;
      case 'large':
        return 18;
      default:
        return 14;
    }
  };
  
  const textColor = color || colors.text;
  
  return (
    <Text style={[styles.text, { fontSize: getFontSize(), color: textColor }]}>
      <Text style={[styles.symbol, { fontSize: getSymbolSize(), color: textColor }]}>Ƶ</Text>
      {amount.toLocaleString()}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
  },
  symbol: {
    fontWeight: 'bold',
    marginRight: 1,
  },
});