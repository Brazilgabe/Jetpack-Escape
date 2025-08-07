import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParallaxBackgroundProps {
  scrollOffset: Animated.SharedValue<number>;
  distance?: Animated.SharedValue<number>;
}

const SKY_COLORS = ['#38a5e3', '#3b97dd', '#403e9b', '#13122e', '#000000'];

const CLOUD_TYPES = [
  require('@/assets/sky-decoration/cloud-1.png'),
  require('@/assets/sky-decoration/cloud-2.png'),
  require('@/assets/sky-decoration/cloud-3.png'),
  require('@/assets/sky-decoration/cloud-4.png'),
];

export default function ParallaxBackground({ scrollOffset, distance }: ParallaxBackgroundProps) {
  const parallaxSpeed = 0.3;

  const cloudLeftPositions = useRef<number[]>(
    Array.from({ length: CLOUD_TYPES.length }, () => Math.floor(Math.random() * (SCREEN_WIDTH + 60)) - 60)
  );

  const cloudTopOffsets = useRef<number[]>(
    Array.from({ length: CLOUD_TYPES.length }, () => Math.floor(Math.random() * SCREEN_HEIGHT))
  );

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    const currentDistance = distance ? distance.value : scrollOffset.value / 10;
    const progress = Math.min(currentDistance / 100000, 1);

    return {
      backgroundColor: interpolateColor(
        progress,
        [0, 0.25, 0.5, 0.75, 1],
        SKY_COLORS
      ),
    };
  });

  const cityAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollOffset.value * 0.6 }],
  }));

  const whiteHouseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollOffset.value * parallaxSpeed }],
  }));

  const cloudOpacityStyle = useAnimatedStyle(() => {
    const currentDistance = distance ? distance.value : scrollOffset.value / 10;
    let opacity = 1;
    if (currentDistance > 10000) {
      const fadeProgress = Math.min((currentDistance - 10000) / 16000, 1);
      opacity = 1 - fadeProgress;
    }
    return { opacity };
  });

  return (
    <View style={styles.container}>
      {/* Sky Gradient */}
      <Animated.View style={styles.skyLayer}>
        <Animated.View style={[styles.gradient, gradientAnimatedStyle]} />
      </Animated.View>

      {/* White House PNG Layer */}
      <Animated.View style={[styles.whiteHouseLayer, whiteHouseAnimatedStyle]}>
        <Image 
          source={require('@/assets/scenary/white-house.png')}
          style={styles.whiteHouse}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Clouds Layer */}
      <Animated.View style={styles.cloudsLayer}>
        {CLOUD_TYPES.map((cloudSource, index) => {
          const cloudAnimatedStyle = useAnimatedStyle(() => {
            const cloudSpeed = scrollOffset.value * parallaxSpeed;
            const loopRange = SCREEN_HEIGHT + 200;
            const cloudStart = cloudTopOffsets.current[index];
            const cloudCurrentPosition = ((cloudStart + cloudSpeed) % loopRange) - 100;

            const isAtTop = cloudCurrentPosition <= -90;

            if (isAtTop) {
              cloudLeftPositions.current[index] = Math.floor(Math.random() * (SCREEN_WIDTH + 60)) - 60;
            }

            return {
              top: cloudCurrentPosition,
              left: cloudLeftPositions.current[index],
              width: 120,
              height: 80,
              transform: [{ scale: 0.8 + (index * 0.1) }],
            };
          });

          return (
            <Animated.View
              key={`cloud-${index}`}
              style={[
                styles.cloud,
                cloudOpacityStyle,
                cloudAnimatedStyle,
              ]}
            >
              <Image
                source={cloudSource}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </Animated.View>
          );
        })}
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
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#38a5e3',
  },
  whiteHouseLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.8,
    width: SCREEN_WIDTH,
    zIndex: 1,
  },
  whiteHouse: {
    width: '100%',
    height: '100%',
  },
  cloudsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
  },
  cloud: {
    position: 'absolute',
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
