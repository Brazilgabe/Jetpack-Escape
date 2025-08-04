import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import JetpackFlame from '@/components/game/components/JetpackFlame';

interface PlayerProps {
  animatedStyle: any;
  isJetpackActive: Animated.SharedValue<boolean>;
}

export default function Player({ animatedStyle, isJetpackActive }: PlayerProps) {
  const jetpackFlameStyle = useAnimatedStyle(() => ({
    opacity: isJetpackActive.value ? 1 : 0,
    transform: [
      { scaleY: isJetpackActive.value ? 1 : 0.3 },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Jetpack Flame */}
      <Animated.View style={[styles.flameContainer, jetpackFlameStyle]}>
        <JetpackFlame />
      </Animated.View>
      
      {/* Player Body */}
      <View style={styles.player}>
        <LinearGradient
          colors={['#ff6b6b', '#ee5a24']}
          style={styles.body}
        />
        
        {/* Jetpack */}
        <View style={styles.jetpack}>
          <LinearGradient
            colors={['#4a4a4a', '#2a2a2a']}
            style={styles.jetpackBody}
          />
        </View>
        
        {/* Eyes */}
        <View style={styles.eye} />
        <View style={[styles.eye, styles.eyeRight]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 3,
  },
  flameContainer: {
    position: 'absolute',
    bottom: -35,
    left: 15,
    zIndex: -1,
  },
  player: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  body: {
    width: 40,
    height: 50,
    borderRadius: 20,
    position: 'absolute',
    left: 10,
    top: 5,
  },
  jetpack: {
    position: 'absolute',
    right: 0,
    top: 15,
    width: 20,
    height: 30,
  },
  jetpackBody: {
    flex: 1,
    borderRadius: 10,
  },
  eye: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    left: 18,
    top: 15,
  },
  eyeRight: {
    left: 28,
  },
});