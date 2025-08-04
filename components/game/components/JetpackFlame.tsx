import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function JetpackFlame() {
  const flameScale = useSharedValue(1);
  const flameOpacity = useSharedValue(0.8);

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
  }, []);

  const flameAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: flameScale.value }],
    opacity: flameOpacity.value,
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
      {[...Array(3)].map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              left: 5 + index * 8,
              animationDelay: `${index * 100}ms`,
            },
          ]}
        />
      ))}
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
    width: 30,
    height: 35,
    borderRadius: 15,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  flameGradient: {
    flex: 1,
    borderRadius: 15,
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