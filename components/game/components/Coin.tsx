import React from 'react';
import { View, StyleSheet } from 'react-native';
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
import { Coin as CoinType } from '@/components/game/types/GameTypes';

interface CoinProps {
  coin: CoinType;
}

export default function Coin({ coin }: CoinProps) {
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
    () => coin.collected.value,
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
    const coinX = coin.x.value;
    const coinY = coin.y.value;
    const currentScale = scale.value;
    const currentOpacity = opacity.value;
    
    return {
      transform: [
        { translateX: coinX },
        { translateY: coinY },
        { scale: currentScale },
      ],
      opacity: currentOpacity,
    };
  });

  if (isCollected) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={['#ffd93d', '#f39c12', '#e67e22']}
        style={styles.coin}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  coin: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});
