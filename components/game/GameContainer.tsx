import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  makeMutable,
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
const GROUND_LEVEL =
  SCREEN_HEIGHT - GameConfig.PLAYER_SIZE - GameConfig.GROUND_OFFSET;
const TARGET_HEIGHT = SCREEN_HEIGHT * GameConfig.TARGET_HEIGHT_RATIO;
const MAX_OBSTACLES = 20;
const MAX_COINS = 20;

export default function GameContainer() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [scoreState, setScoreState] = useState(0);
  const [coinsState, setCoinsState] = useState(0);
  const [distanceState, setDistanceState] = useState(0);
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

  const obstacles = useSharedValue<ObstacleType[]>([]);
  // Coins that are currently active in the game world
  const coinsList = useSharedValue<CoinType[]>([]);

  const startGame = () => {
    setGameState('playing');
    setScoreState(0);
    setCoinsState(0);
    setDistanceState(0);
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
    lastTimeRef.current = 0;
    obstacles.value = Array.from({ length: MAX_OBSTACLES }, (_, i) => ({
      id: `obstacle-${i}`,
      type: 'platform',
      x: makeMutable(-100),
      y: makeMutable(-100),
      width: 40,
      height: 40,
      active: makeMutable(false),
    }));
    coinsList.value = Array.from({ length: MAX_COINS }, (_, i) => ({
      id: `coin-${i}`,
      x: makeMutable(-100),
      y: makeMutable(-100),
      collected: makeMutable(false),
      active: makeMutable(false),
    }));
    startGameLoop();
  };

  const gameOver = () => {
    setGameState('gameOver');
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    hasStarted.value = false;

    const finalScore = Math.floor(score.value);
    const finalCoins = Math.floor(coins.value);
    const finalDistance = Math.floor(distance.value);
    setScoreState(finalScore);
    setCoinsState(finalCoins);
    setDistanceState(finalDistance);

    const newRecord = finalScore > highScore;
    setIsNewRecord(newRecord);

    if (newRecord) {
      setHighScore(finalScore);
    }
  };

  const restartGame = () => {
    setGameState('start');
  };

  const startGameLoop = () => {
    const FRAME_DURATION = 1000 / 60;
    lastTimeRef.current = performance.now();
    let accumulator = 0;

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min(currentTime - lastTimeRef.current, 100);
      lastTimeRef.current = currentTime;
      accumulator += deltaTime;

      while (accumulator >= FRAME_DURATION) {
        updateGame(FRAME_DURATION / 1000);
        accumulator -= FRAME_DURATION;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const updateGame = (deltaSeconds: number) => {
    const gravity = GameConfig.GRAVITY;
    const jetpackForce = GameConfig.JETPACK_FORCE;

    // Vertical physics
    if (!hasStarted.value && playerY.value >= GROUND_LEVEL) {
      // Keep the player grounded before the first input
      playerY.value = GROUND_LEVEL;
      playerVelocity.value = 0;
    } else {
      if (isJetpackActive.value) {
        playerVelocity.value -= jetpackForce * deltaSeconds;
      } else {
        playerVelocity.value += gravity * deltaSeconds;
      }

      // Cap vertical speed for stability
      playerVelocity.value = Math.max(
        -GameConfig.MAX_VELOCITY,
        Math.min(GameConfig.MAX_VELOCITY, playerVelocity.value),
      );

      playerY.value += playerVelocity.value * deltaSeconds;

      if (playerY.value < GROUND_LEVEL) {
        hasLiftedOff.value = true;
      }

      // Clamp height to target
      if (playerY.value < TARGET_HEIGHT) {
        playerY.value = TARGET_HEIGHT;
        playerVelocity.value = Math.max(playerVelocity.value, 0);
      }

      // Ground collision after the game has started
      if (hasLiftedOff.value && playerY.value >= GROUND_LEVEL) {
        playerY.value = GROUND_LEVEL;
        playerVelocity.value = 0;
        runOnJS(gameOver)();
        return;
      }
    }

    // Update horizontal movement based on touch direction
    playerX.value +=
      controlDirection.value * GameConfig.HORIZONTAL_SPEED * deltaSeconds;
    playerX.value = Math.max(
      0,
      Math.min(SCREEN_WIDTH - GameConfig.PLAYER_SIZE, playerX.value),
    );

    if (!hasStarted.value) {
      return;
    }

    // Update scroll offset for background
    scrollOffset.value += GameConfig.SCROLL_SPEED * deltaSeconds;

    // Difficulty scales with distance travelled
    const difficulty = 1 + scrollOffset.value / GameConfig.DIFFICULTY_DISTANCE;

    // Calculate player hitbox for precise collision detection
    const playerHitbox = {
      x: playerX.value + GameConfig.PLAYER_HITBOX.offsetX,
      y: playerY.value + GameConfig.PLAYER_HITBOX.offsetY,
      width: GameConfig.PLAYER_HITBOX.width,
      height: GameConfig.PLAYER_HITBOX.height,
    };

    // Update and spawn obstacles
    obstacles.value.forEach((o) => {
      if (!o.active.value) return;
      o.y.value += GameConfig.OBSTACLE_SPEED * difficulty * deltaSeconds;
      if (o.y.value > SCREEN_HEIGHT) {
        o.active.value = false;
      }
    });
    if (Math.random() < GameConfig.OBSTACLE_SPAWN_RATE * difficulty) {
      const idx = obstacles.value.findIndex((o) => !o.active.value);
      if (idx !== -1) {
        const width = 40;
        const height = 100;
        const xPos = Math.random() * (SCREEN_WIDTH - width);
        const obstacle = obstacles.value[idx];
        obstacle.type = 'platform';
        obstacle.x.value = xPos;
        obstacle.y.value = -height;
        obstacle.width = width;
        obstacle.height = height;
        obstacle.active.value = true;
      }
    }

    // Collision detection between player and obstacles
    for (const o of obstacles.value) {
      if (!o.active.value) continue;
      const collision =
        playerHitbox.x < o.x.value + o.width &&
        playerHitbox.x + playerHitbox.width > o.x.value &&
        playerHitbox.y < o.y.value + o.height &&
        playerHitbox.y + playerHitbox.height > o.y.value;
      if (collision) {
        runOnJS(gameOver)();
        return;
      }
    }

    // Update and spawn coins
    coinsList.value.forEach((c) => {
      if (!c.active.value) return;
      c.y.value += GameConfig.OBSTACLE_SPEED * difficulty * deltaSeconds;
      if (c.y.value > SCREEN_HEIGHT || c.collected.value) {
        c.active.value = false;
      }
    });
    if (Math.random() < GameConfig.COIN_SPAWN_RATE) {
      const idx = coinsList.value.findIndex((c) => !c.active.value);
      if (idx !== -1) {
        const coin = coinsList.value[idx];
        const xPos = Math.random() * (SCREEN_WIDTH - GameConfig.COIN_SIZE);
        coin.x.value = xPos;
        coin.y.value = -GameConfig.COIN_SIZE * 2;
        coin.collected.value = false;
        coin.active.value = true;
      }
    }
    for (const c of coinsList.value) {
      if (!c.active.value || c.collected.value) continue;
      const collected =
        playerHitbox.x < c.x.value + GameConfig.COIN_SIZE &&
        playerHitbox.x + playerHitbox.width > c.x.value &&
        playerHitbox.y < c.y.value + GameConfig.COIN_SIZE &&
        playerHitbox.y + playerHitbox.height > c.y.value;
      if (collected) {
        c.collected.value = true;
        c.active.value = false;
        coins.value += 1;
      }
    }

    // Update distance and score
    const distanceIncrement = GameConfig.SCROLL_SPEED * deltaSeconds * 0.1;
    distance.value += distanceIncrement;
    score.value += Math.floor(distanceIncrement * 10);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      panStartX.value = playerX.value;
      isJetpackActive.value = true;
      controlDirection.value = 0;
      hasStarted.value = true;
    })
    .onUpdate((event) => {
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
      // Reset upward velocity so gravity takes effect immediately
      playerVelocity.value = Math.max(playerVelocity.value, 0);
    })
    .onFinalize(() => {
      // Ensure jetpack is turned off if the gesture is cancelled
      isJetpackActive.value = false;
      playerVelocity.value = Math.max(playerVelocity.value, 0);
    });

  const tapGesture = Gesture.Tap()
    .onTouchesDown((e) => {
      const touchX = e.allTouches[0].x;
      controlDirection.value = touchX < SCREEN_WIDTH / 2 ? -1 : 1;
      isJetpackActive.value = true;
      hasStarted.value = true;
    })
    .onTouchesUp(() => {
      controlDirection.value = 0;
      isJetpackActive.value = false;
      // Reset upward velocity when jetpack is released
      playerVelocity.value = Math.max(playerVelocity.value, 0);
    })
    .onFinalize(() => {
      // Safeguard to stop jetpack and horizontal movement
      controlDirection.value = 0;
      isJetpackActive.value = false;
      playerVelocity.value = Math.max(playerVelocity.value, 0);
    });

  const combinedGesture = Gesture.Race(panGesture, tapGesture);

  const playerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: playerX.value },
      { translateY: playerY.value },
      { rotate: '0deg' },
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
              distance={distance}
              isJetpackActive={isJetpackActive}
              obstacles={obstacles}
              coinsList={coinsList}
            />
          </View>
        </GestureDetector>
      )}

      {gameState === 'gameOver' && (
        <GameOverScreen
          score={scoreState}
          coins={coinsState}
          distance={Math.floor(distanceState)}
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
