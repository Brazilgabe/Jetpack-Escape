import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { FuelRefill as FuelRefillType } from '@/components/game/types/GameTypes';

interface FuelRefillProps {
  fuelRefill: FuelRefillType;
}

export default function FuelRefill({ fuelRefill }: FuelRefillProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const [isCollected, setIsCollected] = React.useState(false);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, []);

  // Handle collection animation
  useAnimatedReaction(
    () => fuelRefill.collected.value,
    (value) => {
      if (value) {
        scale.value = withTiming(1.5, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(setIsCollected)(true);
      }
    }
  );

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    // Access shared values within the worklet
    const refillX = fuelRefill.x.value;
    const refillY = fuelRefill.y.value;
    const currentScale = scale.value;
    const currentOpacity = opacity.value;
    
    return {
      transform: [
        { translateX: refillX },
        { translateY: refillY },
        { scale: currentScale },
      ],
      opacity: currentOpacity,
    };
  });

  const getFuelRefillColors = () => {
    switch (fuelRefill.type) {
      case 'small':
        return ['#4ecdc4', '#45b7aa']; // Green
      case 'medium':
        return ['#ffa500', '#ff8c00']; // Orange
      case 'large':
        return ['#ff6b6b', '#ff5252']; // Red
      default:
        return ['#4ecdc4', '#45b7aa'];
    }
  };

  const getFuelRefillIcon = () => {
    switch (fuelRefill.type) {
      case 'small':
        return '⛽';
      case 'medium':
        return '🛢️';
      case 'large':
        return '🚀';
      default:
        return '⛽';
    }
  };

  if (isCollected) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={getFuelRefillColors()}
        style={styles.fuelRefill}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getFuelRefillIcon()}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  fuelRefill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    color: '#ffffff',
  },
});
