import React from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParallaxBackgroundProps {
  scrollOffset: Animated.SharedValue<number>;
}

// Color transition steps
const SKY_COLORS = [
  '#38a5e3',
  '#39a2e2',
  '#3a9ee0',
  '#3b9bdf',
  '#3b97dd',
  '#3c93db',
  '#3d8fda',
  '#3e8cd9',
  '#3f88d7',
  '#4084d5',
  '#4181d4',
  '#427dd2',
  '#437ad1',
  '#4476d0',
  '#4572ce',
  '#456fcc',
  '#466bcb',
  '#4768c9',
  '#4863c8',
  '#4960c6',
  '#4a5cc5',
  '#4b59c3',
  '#4c55c2',
  '#4d51c0',
  '#4e4ebf',
  '#4c4bba',
  '#4948b3',
  '#4644aa',
  '#4341a2',
  '#403e9b',
  '#3d3b94',
  '#3a388c',
  '#363483',
  '#33317c',
  '#302e74',
  '#2d2c6d',
  '#292864',
  '#26255c',
  '#232255',
  '#201f4d',
  '#1d1c46',
  '#19183d',
  '#161536',
  '#13122e',
  '#100f27',
  '#0c0c1e',
  '#090916',
  '#06060f',
  '#030307',
  '#000000'
];


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



  const gradientAnimatedStyle = useAnimatedStyle(() => {
    const progress = Math.min(scrollOffset.value / 100000, 1);
    const colorIndex = Math.floor(progress * (SKY_COLORS.length - 1));
    const nextColorIndex = Math.min(colorIndex + 1, SKY_COLORS.length - 1);
    const localProgress = (progress * (SKY_COLORS.length - 1)) % 1;
    
    const startColor = SKY_COLORS[colorIndex];
    const endColor = SKY_COLORS[nextColorIndex];
    
    return {
      backgroundColor: interpolateColor(
        localProgress,
        [0, 1],
        [startColor, endColor]
      ),
    };
  });

  return (
    <View style={styles.container}>
      {/* Sky Gradient */}
      <Animated.View style={[styles.skyLayer, skyAnimatedStyle]}>
        <Animated.View style={[styles.gradient, gradientAnimatedStyle]} />
      </Animated.View>
      
      {/* Initial Scene - White House */}
      <Animated.View style={[styles.initialScene, skyAnimatedStyle]}>
        <Image 
          source={require('@/assets/scenary/white-house.png')}
          style={styles.whiteHouse}
          resizeMode="contain"
        />
      </Animated.View>
      
      {/* Clouds Layer */}
      <Animated.View style={[styles.cloudsLayer, cloudsAnimatedStyle]}>
        {[...Array(15)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.cloud,
              {
                left: (index * SCREEN_WIDTH * 0.15) % SCREEN_WIDTH,
                top: (index * 100) % SCREEN_HEIGHT,
                opacity: 0.8 - (index * 0.02),
                width: 60 + (index % 3) * 20,
                height: 30 + (index % 2) * 10,
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
  initialScene: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    zIndex: 1,
  },
  whiteHouse: {
    width: '100%',
    height: '100%',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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