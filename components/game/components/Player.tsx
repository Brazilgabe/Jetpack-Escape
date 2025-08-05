import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import JetpackFlame from '@/components/game/components/JetpackFlame';

interface PlayerProps {
  animatedStyle: any;
  isJetpackActive: Animated.SharedValue<boolean>;
}

export default function Player({ animatedStyle, isJetpackActive }: PlayerProps) {
  const leftFlameStyle = useAnimatedStyle(() => ({
    opacity: isJetpackActive.value ? 1 : 0,
    transform: [
      { scaleY: isJetpackActive.value ? 1 : 0.3 },
    ],
  }));

  const rightFlameStyle = useAnimatedStyle(() => ({
    opacity: isJetpackActive.value ? 1 : 0,
    transform: [
      { scaleY: isJetpackActive.value ? 1 : 0.3 },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Character Image */}
      <Image 
        source={require('@/assets/characters/character-trump.png')}
        style={styles.character}
        resizeMode="contain"
      />
      
      {/* Left Flame */}
      <Animated.View style={[styles.leftFlameContainer, leftFlameStyle]}>
        <JetpackFlame />
      </Animated.View>
      
      {/* Right Flame */}
      <Animated.View style={[styles.rightFlameContainer, rightFlameStyle]}>
        <JetpackFlame />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 3,
    width: 60,
    height: 80,
  },
  character: {
    width: '100%',
    height: '100%',
  },
  leftFlameContainer: {
    position: 'absolute',
    bottom: -25,
    left: 15,
    zIndex: -1,
  },
  rightFlameContainer: {
    position: 'absolute',
    bottom: -25,
    right: 15,
    zIndex: -1,
  },
});