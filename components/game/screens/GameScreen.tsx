import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ParallaxBackground from '@/components/game/screens/ParallaxBackground';
import Player from '@/components/game/components/Player';
import GameHUD from '@/components/game/components/GameHUD';
import { GameProps } from '@/components/game/types/GameTypes';
import Obstacle from '@/components/game/components/Obstacle';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GameScreen({
  playerAnimatedStyle,
  scrollOffset,
  score,
  coins,
  distance,
  isJetpackActive,
  obstacles,
}: GameProps) {
  return (
    <View style={styles.container}>
      <ParallaxBackground scrollOffset={scrollOffset} />

      <View style={styles.gameArea}>
        {obstacles.map(obstacle => (
          <Obstacle key={obstacle.id} obstacle={obstacle} />
        ))}
        <Player
          animatedStyle={playerAnimatedStyle}
          isJetpackActive={isJetpackActive}
        />
      </View>
      
      <GameHUD 
        score={score}
        coins={coins}
        distance={distance}
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