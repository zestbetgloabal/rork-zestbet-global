import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import colors from '@/constants/colors';

interface SegmentedControlProps {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: any;
  tintColor?: string;
  labels?: string[];
}

export default function SegmentedControl({
  values,
  selectedIndex,
  onChange,
  style,
  tintColor = colors.primary,
  labels
}: SegmentedControlProps) {
  const handlePress = (index: number) => {
    onChange(index);
  };

  // Use labels if provided, otherwise use values
  const displayLabels = labels || values;

  return (
    <View style={[styles.container, style]}>
      {values.map((value, index) => (
        <Pressable
          key={index}
          style={[
            styles.segment,
            index === selectedIndex && { backgroundColor: tintColor }
          ]}
          onPress={() => handlePress(index)}
        >
          <Text
            style={[
              styles.segmentText,
              index === selectedIndex && styles.selectedSegmentText
            ]}
          >
            {displayLabels[index]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 8,
    padding: 2,
    height: 36,
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedSegmentText: {
    color: 'white',
    fontWeight: '600',
  },
});