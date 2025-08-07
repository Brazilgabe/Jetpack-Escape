import React from 'react';
import { View, StyleSheet } from 'react-native';
import ParallaxBackground from '@/components/game/screens/ParallaxBackground';
import Player from '@/components/game/components/Player';
import GameHUD from '@/components/game/components/GameHUD';
import { GameProps } from '@/components/game/types/GameTypes';
import Obstacle from '@/components/game/components/Obstacle';
import Coin from '@/components/game/components/Coin';

export default function GameScreen({
  playerAnimatedStyle,
  scrollOffset,
  score,
  coins,
  distance,
  isJetpackActive,
  obstacles,
  coinsList,
  hudScore,
  hudCoins,
  hudDistance,
}: GameProps) {
  return (
    <View style={styles.container}>
      <ParallaxBackground scrollOffset={scrollOffset} distance={distance} />

      <View style={styles.gameArea}>
        {/* {obstacles?.map((obstacle) => (
          <Obstacle key={obstacle.id} obstacle={obstacle} />
        ))} */}
        {coinsList?.map((coin) => (
          <Coin key={coin.id} coin={coin} />
        ))}
        <Player
          animatedStyle={playerAnimatedStyle}
          isJetpackActive={isJetpackActive}
        />
      </View>

      <GameHUD 
        scoreValue={hudScore || 0}
        coinsValue={hudCoins || 0}
        distanceValue={hudDistance || 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
});
