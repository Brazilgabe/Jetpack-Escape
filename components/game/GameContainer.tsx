import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import StartScreen from '@/components/game/screens/StartScreen';
import GameScreen from '@/components/game/screens/GameScreen';
import GameOverScreen from '@/components/game/screens/GameOverScreen';
import {
  GameState,
  GameConfig,
  Obstacle as ObstacleType,
  Coin as CoinType,
} from './types/GameTypes';



const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GROUND_LEVEL = SCREEN_HEIGHT - GameConfig.PLAYER_SIZE - GameConfig.GROUND_OFFSET;
const TARGET_HEIGHT = SCREEN_HEIGHT * GameConfig.TARGET_HEIGHT_RATIO;

// Helper function to create SharedValue objects outside of hooks
const createSharedValue = (value: number) => {
  const sharedValue = { value };
  return sharedValue;
};

const createBooleanSharedValue = (value: boolean) => {
  const sharedValue = { value };
  return sharedValue;
};

export default function GameContainer() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const playerY = useSharedValue(GROUND_LEVEL);
  const playerX = useSharedValue(SCREEN_WIDTH / 2 - GameConfig.PLAYER_SIZE / 2);
  const playerVelocity = useSharedValue(0);
  const isJetpackActive = useSharedValue(false);
  const controlDirection = useSharedValue(0);
  const panStartX = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const hasStarted = useSharedValue(false);
  const hasLiftedOff = useSharedValue(false);

  const score = useSharedValue(0);
  const coins = useSharedValue(0);
  const distance = useSharedValue(0);

  const obstaclesRef = useRef<ObstacleType[]>([]);
  const coinsRef = useRef<CoinType[]>([]);
  const [obstacles, setObstacles] = useState<ObstacleType[]>([]);
  const [coinsList, setCoinsList] = useState<CoinType[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);
  const [finalDistance, setFinalDistance] = useState(0);
  const [hudScore, setHudScore] = useState(0);
  const [hudCoins, setHudCoins] = useState(0);
  const [hudDistance, setHudDistance] = useState(0);

  // Smooth player movement with spring animation
  const displayY = useDerivedValue(() => 
    withSpring(playerY.value, { 
      damping: 15, 
      stiffness: 100,
      mass: 0.8 
    })
  );

  // Optimized reactions
  useAnimatedReaction(
    () => Math.floor(scrollOffset.value / 10),
    (val) => {
      distance.value = withTiming(val, { duration: 100 });
    }
  );

  useAnimatedReaction(
    () => Math.floor(scrollOffset.value / 10),
    (val) => {
      score.value = withTiming(val * 10, { duration: 100 });
    }
  );

  // Sync SharedValues to React state for HUD
  useAnimatedReaction(
    () => score.value,
    (value) => {
      runOnJS(setHudScore)(Math.floor(value));
    }
  );

  useAnimatedReaction(
    () => coins.value,
    (value) => {
      runOnJS(setHudCoins)(Math.floor(value));
    }
  );

  useAnimatedReaction(
    () => distance.value,
    (value) => {
      runOnJS(setHudDistance)(Math.floor(value));
    }
  );

  const startGame = useCallback(() => {
    setGameState('playing');
    score.value = 0;
    coins.value = 0;
    distance.value = 0;
    playerY.value = GROUND_LEVEL;
    playerX.value = SCREEN_WIDTH / 2 - GameConfig.PLAYER_SIZE / 2;
    playerVelocity.value = 0;
    isJetpackActive.value = false;
    controlDirection.value = 0;
    scrollOffset.value = 0;
    hasStarted.value = false;
    hasLiftedOff.value = false;
    lastTimeRef.current = performance.now();
    obstaclesRef.current = [];
    coinsRef.current = [];
    setObstacles([]);
    setCoinsList([]);
    startGameLoop();
  }, []);

  const gameOver = useCallback(() => {
    setGameState('gameOver');
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    hasStarted.value = false;
    const newRecord = score.value > highScore;
    setIsNewRecord(newRecord);
    setFinalScore(Math.floor(score.value));
    setFinalCoins(Math.floor(coins.value));
    setFinalDistance(Math.floor(distance.value));
    if (newRecord) setHighScore(score.value);
  }, [highScore]);

  const restartGame = useCallback(() => setGameState('start'), []);

  const startGameLoop = useCallback(() => {
    lastTimeRef.current = performance.now();
    const loop = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      updateGame(dt);
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    gameLoopRef.current = requestAnimationFrame(loop);
  }, []);

  const updateGame = useCallback((dt: number) => {
    const gravity = GameConfig.GRAVITY;
    const jetpackForce = GameConfig.JETPACK_FORCE;

    if (!hasStarted.value && playerY.value >= GROUND_LEVEL) {
      playerY.value = GROUND_LEVEL;
      playerVelocity.value = 0;
    } else {
      if (isJetpackActive.value) playerVelocity.value -= jetpackForce * dt;
      else playerVelocity.value += gravity * dt;

      playerVelocity.value = Math.max(-GameConfig.MAX_VELOCITY, Math.min(GameConfig.MAX_VELOCITY, playerVelocity.value));
      playerY.value += playerVelocity.value * dt;
      if (playerY.value < GROUND_LEVEL) hasLiftedOff.value = true;
      if (playerY.value < TARGET_HEIGHT) {
        playerY.value = TARGET_HEIGHT;
        playerVelocity.value = Math.max(playerVelocity.value, 0);
      }
      if (hasLiftedOff.value && playerY.value >= GROUND_LEVEL && playerVelocity.value >= 0) {
        playerY.value = GROUND_LEVEL;
        playerVelocity.value = 0;
        runOnJS(gameOver)();
        return;
      }
    }

    playerX.value += controlDirection.value * GameConfig.HORIZONTAL_SPEED * dt;
    playerX.value = Math.max(0, Math.min(SCREEN_WIDTH - GameConfig.PLAYER_SIZE, playerX.value));
    if (!hasStarted.value) return;
    scrollOffset.value += GameConfig.SCROLL_SPEED * dt;

    // Update obstacles with optimized logic
    let obs = obstaclesRef.current.map(o => ({ 
      ...o, 
      y: { ...o.y, value: o.y.value + GameConfig.OBSTACLE_SPEED * dt } 
    }));
    obs = obs.filter(o => o.y.value < SCREEN_HEIGHT);
    if (Math.random() < GameConfig.OBSTACLE_SPAWN_RATE) {
      const width = 40;
      const height = 100;
      const x = Math.random() * (SCREEN_WIDTH - width);
      const newObstacle: ObstacleType = {
        id: Date.now().toString(),
        type: 'platform',
        x: createSharedValue(x),
        y: createSharedValue(-height),
        width,
        height,
        active: createBooleanSharedValue(true)
      };
      obs.push(newObstacle);
    }
    obstaclesRef.current = obs;
    runOnJS(setObstacles)(obs);

    // Update coins with optimized logic
    let coins = coinsRef.current.map(c => ({ 
      ...c, 
      y: { ...c.y, value: c.y.value + GameConfig.OBSTACLE_SPEED * dt } 
    }));
    coins = coins.filter(c => c.y.value < SCREEN_HEIGHT && !c.collected.value);
    if (Math.random() < GameConfig.COIN_SPAWN_RATE) {
      const x = Math.random() * (SCREEN_WIDTH - GameConfig.COIN_SIZE);
      const newCoin: CoinType = {
        id: `coin-${Date.now()}`,
        x: createSharedValue(x),
        y: createSharedValue(-GameConfig.COIN_SIZE * 2),
        collected: createBooleanSharedValue(false),
        active: createBooleanSharedValue(true)
      };
      coins.push(newCoin);
    }
    coinsRef.current = coins;
    runOnJS(setCoinsList)(coins);
  }, [gameOver]);

  // Cross-platform gesture handling
  const panGesture = Gesture.Pan()
    .onStart((event) => {
      panStartX.value = playerX.value;
      isJetpackActive.value = true;
      controlDirection.value = 0;
      hasStarted.value = true;
      // Only set hasLiftedOff if player is actually lifting off
      if (playerY.value < GROUND_LEVEL) {
        hasLiftedOff.value = true;
      }
    })
    .onUpdate((event) => {
      // Handle horizontal movement
      playerX.value = Math.max(0, Math.min(SCREEN_WIDTH - GameConfig.PLAYER_SIZE, panStartX.value + event.translationX));
      
      // Keep jetpack active while touching
      isJetpackActive.value = true;
    })
    .onEnd(() => {
      isJetpackActive.value = false;
      playerVelocity.value = Math.max(playerVelocity.value, 0);
    })
    .onFinalize(() => {
      isJetpackActive.value = false;
      playerVelocity.value = Math.max(playerVelocity.value, 0);
    })
    .minDistance(0)
    .shouldCancelWhenOutside(false);

  const tapGesture = Gesture.Tap()
    .onTouchesDown(() => {
      isJetpackActive.value = true;
      hasStarted.value = true;
      // Only set hasLiftedOff if player is actually lifting off
      if (playerY.value < GROUND_LEVEL) {
        hasLiftedOff.value = true;
      }
    })
    .onTouchesUp(() => {
      isJetpackActive.value = false;
      playerVelocity.value = Math.max(playerVelocity.value, 0);
    })
    .onFinalize(() => {
      isJetpackActive.value = false;
      playerVelocity.value = Math.max(playerVelocity.value, 0);
    });

  const combinedGesture = Gesture.Race(panGesture, tapGesture);

  // Simplified animated style
  const playerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(playerX.value, { damping: 20, stiffness: 200 }) },
      { translateY: displayY.value },
      { rotate: '0deg' },
    ],
  }));

  return (
    <View style={styles.container}>
      {gameState === 'start' && <StartScreen onStart={startGame} highScore={highScore} />}
      {gameState === 'playing' && (
        <GestureDetector gesture={combinedGesture}>
          <View style={styles.gameArea}>
            <GameScreen
              playerAnimatedStyle={playerAnimatedStyle}
              scrollOffset={scrollOffset}
              score={score}
              coins={coins}
              distance={distance}
              isJetpackActive={isJetpackActive}
              obstacles={obstacles}
              coinsList={coinsList}
              hudScore={hudScore}
              hudCoins={hudCoins}
              hudDistance={hudDistance}
            />
          </View>
        </GestureDetector>
      )}
      {gameState === 'gameOver' && (
        <GameOverScreen
          score={finalScore}
          coins={finalCoins}
          distance={finalDistance}
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