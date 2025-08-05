import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface WHProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function WH({ width = 60, height = 80, color = '#ff6b6b' }: WHProps) {
  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 60 80">
        {/* Body */}
        <Rect x="20" y="30" width="20" height="40" fill={color} stroke="#333" strokeWidth="2" />
        
        {/* Head */}
        <Circle cx="30" cy="20" r="8" fill="#ffdbac" stroke="#333" strokeWidth="1" />
        
        {/* Eyes */}
        <Circle cx="27" cy="18" r="2" fill="#000" />
        <Circle cx="33" cy="18" r="2" fill="#000" />
        
        {/* Jetpack */}
        <Rect x="45" y="35" width="8" height="20" fill="#4a4a4a" stroke="#333" strokeWidth="1" />
        
        {/* Arms */}
        <Rect x="15" y="35" width="5" height="15" fill={color} stroke="#333" strokeWidth="1" />
        <Rect x="40" y="35" width="5" height="15" fill={color} stroke="#333" strokeWidth="1" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 