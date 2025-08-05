import React, { useEffect } from 'react';
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
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const [isActive, setIsActive] = React.useState(true);
  const [isCollected, setIsCollected] = React.useState(false);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 2000 }), -1, false);

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, []);

  // Use useAnimatedReaction to sync active and collected states
  useAnimatedReaction(
    () => coin.active.value,
    (value) => {
      runOnJS(setIsActive)(value);
    }
  );

  useAnimatedReaction(
    () => coin.collected.value,
    (value) => {
      runOnJS(setIsCollected)(value);
    }
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: coin.x.value },
      { translateY: coin.y.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  if (!isActive || isCollected) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={['#ffd93d', '#f39c12', '#e67e22']}
        style={styles.coin}
      />
      <View style={styles.innerCircle} />
      <View style={styles.center} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f1c40f',
    top: 5,
    left: 5,
  },
  center: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    top: 11,
    left: 11,
    opacity: 0.7,
  },
});
