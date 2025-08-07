import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function JetpackFlame() {
  const flameScale = useSharedValue(1);
  const flameOpacity = useSharedValue(0.8);
  const particle1Opacity = useSharedValue(0.7);
  const particle2Opacity = useSharedValue(0.7);
  const particle3Opacity = useSharedValue(0.7);

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 100 }),
        withTiming(0.9, { duration: 100 }),
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      ),
      -1,
      true
    );
    
    flameOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0.6, { duration: 150 })
      ),
      -1,
      true
    );

    // Animate particles with delays
    particle1Opacity.value = withRepeat(
      withDelay(0, withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(0.7, { duration: 500 })
      )),
      -1,
      true
    );

    particle2Opacity.value = withRepeat(
      withDelay(100, withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(0.7, { duration: 500 })
      )),
      -1,
      true
    );

    particle3Opacity.value = withRepeat(
      withDelay(200, withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(0.7, { duration: 500 })
      )),
      -1,
      true
    );
  }, []);

  const flameAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: flameScale.value }],
    opacity: flameOpacity.value,
  }));

  const particle1Style = useAnimatedStyle(() => ({
    opacity: particle1Opacity.value,
  }));

  const particle2Style = useAnimatedStyle(() => ({
    opacity: particle2Opacity.value,
  }));

  const particle3Style = useAnimatedStyle(() => ({
    opacity: particle3Opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.flame, flameAnimatedStyle]}>
        <LinearGradient
          colors={['#ff4757', '#ff6348', '#ffa502', '#ffdd59']}
          style={styles.flameGradient}
        />
      </Animated.View>
      
      {/* Particle effects */}
      <Animated.View style={[styles.particle, { left: -6 }, particle1Style]} />
      <Animated.View style={[styles.particle, { left: 4 }, particle2Style]} />
      <Animated.View style={[styles.particle, { left: 14 }, particle3Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  flame: {
    width: 10,
    height: 35,
    borderRadius: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  flameGradient: {
    flex: 1,
    borderRadius: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#ffa502',
    borderRadius: 2,
    bottom: -10,
    opacity: 0.7,
  },
});