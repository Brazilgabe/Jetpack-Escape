import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import JetpackFlame from '@/components/game/components/JetpackFlame';

interface PlayerProps {
  animatedStyle: any;
  isJetpackActive: Animated.SharedValue<boolean>;
  playerStats?: {
    jetpackSpeed: number;
    fuelEfficiency: number;
  };
}

export default function Player({ animatedStyle, isJetpackActive, playerStats }: PlayerProps) {
  const leftFlameStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: isJetpackActive.value ? 1 : 0,
      transform: [
        { scaleY: isJetpackActive.value ? 1 : 0.3 },
      ],
    };
  });

  const rightFlameStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: isJetpackActive.value ? 1 : 0,
      transform: [
        { scaleY: isJetpackActive.value ? 1 : 0.3 },
      ],
    };
  });

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
        <JetpackFlame intensity={playerStats?.jetpackSpeed || 1} />
      </Animated.View>
      
      {/* Right Flame */}
      <Animated.View style={[styles.rightFlameContainer, rightFlameStyle]}>
        <JetpackFlame intensity={playerStats?.jetpackSpeed || 1} />
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
    width: '160%',
    height: '160%',
  },
  leftFlameContainer: {
    position: 'absolute',
    bottom: -35,
    left: 14.5,
    zIndex: -1,
  },
  rightFlameContainer: {
    position: 'absolute',
    bottom: -35,
    right: -48.5,
    zIndex: -1,
  },
});