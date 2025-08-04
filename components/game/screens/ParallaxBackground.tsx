import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedProps,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface ParallaxBackgroundProps {
  scrollOffset: Animated.SharedValue<number>;
}

export default function ParallaxBackground({ scrollOffset }: ParallaxBackgroundProps) {
  const skyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollOffset.value * 0.1 }],
  }));

  const cloudsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollOffset.value * 0.3 }],
  }));

  const cityAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollOffset.value * 0.6 }],
  }));

  const gradientProps = useAnimatedProps<LinearGradientProps>(() => {
    const top = interpolateColor(scrollOffset.value, [0, 5000], ['#87CEEB', '#0b0d23']);
    const mid = interpolateColor(scrollOffset.value, [0, 5000], ['#4682B4', '#0a0a1a']);
    return { colors: [top, mid, '#1a1a2e'] as [string, string, string] };
  });

  return (
    <View style={styles.container}>
      {/* Sky Gradient */}
      <Animated.View style={[styles.skyLayer, skyAnimatedStyle]}>
        <AnimatedLinearGradient
          colors={['#87CEEB', '#4682B4', '#1a1a2e']}
          animatedProps={gradientProps}
          style={styles.gradient}
        />
      </Animated.View>
      
      {/* Clouds Layer */}
      <Animated.View style={[styles.cloudsLayer, cloudsAnimatedStyle]}>
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.cloud,
              {
                left: (index * SCREEN_WIDTH * 0.4) % SCREEN_WIDTH,
                top: (index * 150) % SCREEN_HEIGHT,
                opacity: 0.6 - (index * 0.1),
              },
            ]}
          />
        ))}
      </Animated.View>
      
      {/* City Silhouette */}
      <Animated.View style={[styles.cityLayer, cityAnimatedStyle]}>
        {[...Array(10)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.building,
              {
                left: index * (SCREEN_WIDTH / 8),
                height: 100 + (index % 3) * 80,
                width: SCREEN_WIDTH / 8,
              },
            ]}
          />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  skyLayer: {
    position: 'absolute',
    top: -SCREEN_HEIGHT,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 3,
  },
  gradient: {
    flex: 1,
  },
  cloudsLayer: {
    position: 'absolute',
    top: -SCREEN_HEIGHT,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 3,
  },
  cloud: {
    position: 'absolute',
    width: 80,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  cityLayer: {
    position: 'absolute',
    bottom: -200,
    left: 0,
    right: 0,
    height: 400,
    flexDirection: 'row',
  },
  building: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginRight: 2,
  },
});