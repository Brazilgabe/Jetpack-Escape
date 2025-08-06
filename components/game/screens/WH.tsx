import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, SvgUri } from 'react-native-svg';

interface WHProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function WH({ width = 60, height = 80, color = '#ff6b6b' }: WHProps) {
  return (
    <View style={styles.container}>
      <SvgUri source={require('@/assets/scenes/white-house.svg')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 