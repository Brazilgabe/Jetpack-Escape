import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import StartScreen from '@/components/game/screens/StartScreen';
import GameScreen from '@/components/game/screens/GameScreen';
import GameOverScreen from '@/components/game/screens/GameOverScreen';
import { GameState, GameConfig } from './types/GameTypes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GameContainer() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const playerY = useSharedValue(SCREEN_HEIGHT / 2);
  const playerVelocity = useSharedValue(0);
  const isJetpackActive = useSharedValue(false);
  const scrollOffset = useSharedValue(0);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCoins(0);
    setDistance(0);
    playerY.value = SCREEN_HEIGHT / 2;
    playerVelocity.value = 0;
    scrollOffset.value = 0;
    lastTimeRef.current = 0;
    startGameLoop();
  };

  const gameOver = () => {
    setGameState('gameOver');
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    const newRecord = score > highScore;
    setIsNewRecord(newRecord);

    if (newRecord) {
      setHighScore(score);
    }
  };

  const restartGame = () => {
    setGameState('start');
  };

  const startGameLoop = () => {
    lastTimeRef.current = performance.now();
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      if (deltaTime > 0) {
        updateGame(deltaTime);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const updateGame = (deltaTime: number) => {
    // Apply gravity and jetpack physics
    const gravity = GameConfig.GRAVITY;
    const jetpackForce = GameConfig.JETPACK_FORCE;
    const deltaSeconds = deltaTime / 1000;
    
    if (isJetpackActive.value) {
      playerVelocity.value += jetpackForce * deltaSeconds;
    } else {
      playerVelocity.value -= gravity * deltaSeconds;
    }
    
    // Limit velocity
    playerVelocity.value = Math.max(-15, Math.min(15, playerVelocity.value));

    // Update player position
    playerY.value += playerVelocity.value * deltaSeconds;
    
    // Check boundaries
    if (playerY.value < 0 || playerY.value > SCREEN_HEIGHT - 60) {
      runOnJS(gameOver)();
      return;
    }
    
    // Update scroll offset for background
    scrollOffset.value += GameConfig.SCROLL_SPEED * deltaSeconds;
    
    // Update distance and score
    const distanceIncrement = GameConfig.SCROLL_SPEED * deltaSeconds * 0.1;
    runOnJS(setDistance)(prev => prev + distanceIncrement);
    runOnJS(setScore)(prev => prev + Math.floor(distanceIncrement * 10));
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isJetpackActive.value = true;
    })
    .onFinalize(() => {
      isJetpackActive.value = false;
    });

  const tapGesture = Gesture.Tap()
    .onTouchesDown(() => {
      isJetpackActive.value = true;
    })
    .onTouchesUp(() => {
      isJetpackActive.value = false;
    });

  const combinedGesture = Gesture.Race(panGesture, tapGesture);

  const playerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: playerY.value },
      { rotate: `${playerVelocity.value * 2}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      {gameState === 'start' && (
        <StartScreen onStart={startGame} highScore={highScore} />
      )}
      
      {gameState === 'playing' && (
        <GestureDetector gesture={combinedGesture}>
          <View style={styles.gameArea}>
            <GameScreen
              playerAnimatedStyle={playerAnimatedStyle}
              scrollOffset={scrollOffset}
              score={score}
              coins={coins}
              distance={Math.floor(distance)}
              isJetpackActive={isJetpackActive}
            />
          </View>
        </GestureDetector>
      )}
      
      {gameState === 'gameOver' && (
        <GameOverScreen
          score={score}
          coins={coins}
          distance={Math.floor(distance)}
          highScore={highScore}
          isNewRecord={isNewRecord}
          onRestart={restartGame}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gameArea: {
    flex: 1,
  },
});