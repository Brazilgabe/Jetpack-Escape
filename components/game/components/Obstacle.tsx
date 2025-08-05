import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Obstacle as ObstacleType } from '@/components/game/types/GameTypes';

interface ObstacleProps {
  obstacle: ObstacleType;
}

export default function Obstacle({ obstacle }: ObstacleProps) {
  const rotation = useSharedValue(0);
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    if (obstacle.type === 'blade') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false,
      );
    }
  }, [obstacle.type]);

  // Use useAnimatedReaction to sync active state
  useAnimatedReaction(
    () => obstacle.active.value,
    (value) => {
      runOnJS(setIsActive)(value);
    }
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: obstacle.x.value },
      { translateY: obstacle.y.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const renderObstacle = () => {
    switch (obstacle.type) {
      case 'platform':
        return (
          <LinearGradient
            colors={['#666666', '#333333']}
            style={[
              styles.platform,
              { width: obstacle.width, height: obstacle.height },
            ]}
          />
        );
      case 'blade':
        return (
          <View style={styles.blade}>
            <LinearGradient
              colors={['#ff4757', '#c44569']}
              style={styles.bladeBody}
            />
          </View>
        );
      case 'laser':
        return (
          <LinearGradient
            colors={['#ff3742', '#ff6b6b']}
            style={[styles.laser, { height: obstacle.height }]}
          />
        );
      case 'bird':
        return (
          <View style={styles.bird}>
            <LinearGradient
              colors={['#8e44ad', '#9b59b6']}
              style={styles.birdBody}
            />
          </View>
        );
      default:
        return null;
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {renderObstacle()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  platform: {
    borderRadius: 8,
  },
  blade: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bladeBody: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  laser: {
    width: 4,
    borderRadius: 2,
  },
  bird: {
    width: 30,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  birdBody: {
    width: 25,
    height: 15,
    borderRadius: 12,
  },
});
