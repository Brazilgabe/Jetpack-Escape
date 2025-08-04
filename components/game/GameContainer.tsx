import React, { useState, useRef } from 'react';
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
import {
  GameState,
  GameConfig,
  Obstacle as ObstacleType,
  Coin as CoinType,
} from './types/GameTypes';

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
  const playerX = useSharedValue(
    SCREEN_WIDTH / 2 - GameConfig.PLAYER_SIZE / 2,
  );
  const playerVelocity = useSharedValue(0);
  const isJetpackActive = useSharedValue(false);
  const controlDirection = useSharedValue(0);
  const panStartX = useSharedValue(0);
  const scrollOffset = useSharedValue(0);

  const obstaclesRef = useRef<ObstacleType[]>([]);
  const [obstacles, setObstacles] = useState<ObstacleType[]>([]);
  // Coins that are currently active in the game world
  const coinsRef = useRef<CoinType[]>([]);
  const [coinsList, setCoinsList] = useState<CoinType[]>([]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCoins(0);
    setDistance(0);
    playerY.value = SCREEN_HEIGHT / 2;
    playerX.value = SCREEN_WIDTH / 2 - GameConfig.PLAYER_SIZE / 2;
    playerVelocity.value = 0;
    scrollOffset.value = 0;
    lastTimeRef.current = 0;
    obstaclesRef.current = [];
    setObstacles([]);
    coinsRef.current = [];
    setCoinsList([]);
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

    // Apply thrust when the jetpack is active, otherwise let gravity pull
    if (isJetpackActive.value) {
      playerVelocity.value -= jetpackForce * deltaSeconds;
    } else {
      playerVelocity.value += gravity * deltaSeconds;
    }
    
    // Limit velocity based on GameConfig.MAX_VELOCITY
    playerVelocity.value = Math.max(
      -GameConfig.MAX_VELOCITY,
      Math.min(GameConfig.MAX_VELOCITY, playerVelocity.value)
    );
    
    // Update player vertical position
    playerY.value += playerVelocity.value * deltaSeconds;

    // Update horizontal movement based on touch direction
    playerX.value +=
      controlDirection.value * GameConfig.HORIZONTAL_SPEED * deltaSeconds;
    playerX.value = Math.max(
      0,
      Math.min(SCREEN_WIDTH - GameConfig.PLAYER_SIZE, playerX.value),
    );
    
    // Check boundaries
    if (playerY.value < 0 || playerY.value > SCREEN_HEIGHT - 60) {
      runOnJS(gameOver)();
      return;
    }
    
    // Update scroll offset for background
    scrollOffset.value += GameConfig.SCROLL_SPEED * deltaSeconds;

    // Calculate player hitbox for precise collision detection
    const playerHitbox = {
      x: playerX.value + GameConfig.PLAYER_HITBOX.offsetX,
      y: playerY.value + GameConfig.PLAYER_HITBOX.offsetY,
      width: GameConfig.PLAYER_HITBOX.width,
      height: GameConfig.PLAYER_HITBOX.height,
    };

    // Update and spawn obstacles
    let obs = obstaclesRef.current.map(o => ({
      ...o,
      y: o.y + GameConfig.OBSTACLE_SPEED * deltaSeconds,
    }));
    obs = obs.filter(o => o.y < SCREEN_HEIGHT);
    if (Math.random() < GameConfig.OBSTACLE_SPAWN_RATE) {
      const width = 40;
      const height = 100;
      const x = Math.random() * (SCREEN_WIDTH - width);
      obs.push({
        id: Date.now().toString(),
        type: 'platform',
        x,
        y: -height,
        width,
        height,
      });
    }
    obstaclesRef.current = obs;
    runOnJS(setObstacles)(obs);

    // Collision detection between player and obstacles
    for (const o of obs) {
      const collision =
        playerHitbox.x < o.x + o.width &&
        playerHitbox.x + playerHitbox.width > o.x &&
        playerHitbox.y < o.y + o.height &&
        playerHitbox.y + playerHitbox.height > o.y;
      if (collision) {
        runOnJS(gameOver)();
        return;
      }
    }

    // Update and spawn coins
    let coinArray = coinsRef.current.map(c => ({
      ...c,
      y: c.y + GameConfig.OBSTACLE_SPEED * deltaSeconds,
    }));
    coinArray = coinArray.filter(c => c.y < SCREEN_HEIGHT && !c.collected);
    if (Math.random() < GameConfig.COIN_SPAWN_RATE) {
      const x = Math.random() * (SCREEN_WIDTH - GameConfig.COIN_SIZE);
      coinArray.push({
        id: `coin-${Date.now().toString()}`,
        x,
        y: -GameConfig.COIN_SIZE * 2,
        collected: false,
      });
    }
    for (const c of coinArray) {
      const collected =
        playerHitbox.x < c.x + GameConfig.COIN_SIZE &&
        playerHitbox.x + playerHitbox.width > c.x &&
        playerHitbox.y < c.y + GameConfig.COIN_SIZE &&
        playerHitbox.y + playerHitbox.height > c.y;
      if (collected && !c.collected) {
        c.collected = true;
        runOnJS(setCoins)(prev => prev + 1);
      }
    }
    coinsRef.current = coinArray;
    runOnJS(setCoinsList)(coinArray);

    // Update distance and score
    const distanceIncrement = GameConfig.SCROLL_SPEED * deltaSeconds * 0.1;
    runOnJS(setDistance)(prev => prev + distanceIncrement);
    runOnJS(setScore)(prev => prev + Math.floor(distanceIncrement * 10));
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      panStartX.value = playerX.value;
      isJetpackActive.value = true;
      controlDirection.value = 0;
    })
    .onUpdate(event => {
      playerX.value = Math.max(
        0,
        Math.min(
          SCREEN_WIDTH - GameConfig.PLAYER_SIZE,
          panStartX.value + event.translationX,
        ),
      );
    })
    .onEnd(() => {
      isJetpackActive.value = false;
    });

  const tapGesture = Gesture.Tap()
    .onTouchesDown(e => {
      const touchX = e.allTouches[0].x;
      controlDirection.value = touchX < SCREEN_WIDTH / 2 ? -1 : 1;
      isJetpackActive.value = true;
    })
    .onTouchesUp(() => {
      controlDirection.value = 0;
      isJetpackActive.value = false;
    });

  const combinedGesture = Gesture.Race(panGesture, tapGesture);

  const playerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: playerX.value },
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
              obstacles={obstacles}
              coinsList={coinsList}
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