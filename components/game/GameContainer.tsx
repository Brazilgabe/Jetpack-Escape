import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  useAnimatedReaction,
  runOnJS,
  makeMutable,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import StartScreen from '@/components/game/screens/StartScreen';
import GameScreen from '@/components/game/screens/GameScreen';
import GameOverScreen from '@/components/game/screens/GameOverScreen';
import StoreScreen from '@/components/game/screens/StoreScreen';
import {
  GameState,
  GameConfig,
  Obstacle as ObstacleType,
  Coin as CoinType,
  PlayerStats,
} from './types/GameTypes';



const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GROUND_LEVEL = SCREEN_HEIGHT - GameConfig.PLAYER_SIZE - GameConfig.GROUND_OFFSET;
const TARGET_HEIGHT = SCREEN_HEIGHT * GameConfig.TARGET_HEIGHT_RATIO;
const STAGING_HEIGHT = SCREEN_HEIGHT * GameConfig.STAGING_HEIGHT_RATIO;

// Helper function to create SharedValue objects outside of hooks
const createSharedValue = (value: number) => makeMutable(value);

const createBooleanSharedValue = (value: boolean) => makeMutable(value);

// Collision detection helper function
const checkCollision = (rect1: { x: number; y: number; width: number; height: number }, rect2: { x: number; y: number; width: number; height: number }) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
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
  const gameStartTime = useSharedValue(0);
  const timeSinceStart = useSharedValue(0);
  const hasReachedStaging = useSharedValue(false);

  const score = useSharedValue(0);
  const coins = useSharedValue(0);
  const distance = useSharedValue(0);
  const hasFuel = useSharedValue(true);

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
  
  // Player stats for upgrades
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    jetpackSpeed: 1,
    fuelEfficiency: 1,
    coinMagnet: 0,
    shieldDuration: 0,
    doubleCoins: false,
    slowMotion: false,
    fuelCapacity: 100,
    currentFuel: 100,
  });

  // Ref for current fuel to avoid stale closure in game loop
  const currentFuelRef = useRef(playerStats.currentFuel);

  // Keep ref in sync with state changes
  useEffect(() => {
    currentFuelRef.current = playerStats.currentFuel;
  }, [playerStats.currentFuel]);

  // Smooth player movement with spring animation
  const displayY = useDerivedValue(() => 
    withSpring(playerY.value, { 
      damping: 50, 
      stiffness: 50,
      mass: 1.5 
    })
  );

  // Use derived values instead of modifying shared values in worklets
  const derivedDistance = useDerivedValue(() => {
    return Math.floor(scrollOffset.value / 10);
  });

  const derivedScore = useDerivedValue(() => {
    return Math.floor(scrollOffset.value / 10) * 10;
  });

  // Sync SharedValues to React state for HUD
  useAnimatedReaction(
    () => derivedScore.value,
    (value) => {
      runOnJS(setHudScore)(value);
    }
  );

  useAnimatedReaction(
    () => coins.value,
    (value) => {
      runOnJS(setHudCoins)(Math.floor(value));
    }
  );

  useAnimatedReaction(
    () => derivedDistance.value,
    (value) => {
      runOnJS(setHudDistance)(value);
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
    hasReachedStaging.value = false;
    timeSinceStart.value = 0;
    lastTimeRef.current = performance.now();
    obstaclesRef.current = [];
    coinsRef.current = [];
    setObstacles([]);
    setCoinsList([]);
    
    // Refill fuel on game start
    setPlayerStats(prev => {
      const next = { ...prev, currentFuel: prev.fuelCapacity };
      currentFuelRef.current = next.currentFuel;
      hasFuel.value = true;
      return next;
    });
    
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
  
  const openStore = useCallback(() => setGameState('store'), []);
  const closeStore = useCallback(() => setGameState('start'), []);
  
  const purchaseUpgrade = useCallback((upgradeId: string) => {
    const upgrade = GameConfig.UPGRADES[upgradeId as keyof typeof GameConfig.UPGRADES];
    if (!upgrade) return;
    
    const currentLevel = getUpgradeLevel(upgradeId);
    const cost = upgrade.baseCost * (currentLevel + 1);
    
    if (coins.value >= cost && currentLevel < upgrade.maxLevel) {
      coins.value -= cost;
      
      setPlayerStats(prevStats => {
        const newStats = { ...prevStats };
        
        switch (upgradeId) {
          case 'jetpack_speed':
            newStats.jetpackSpeed = upgrade.effect(currentLevel + 1);
            break;
          case 'fuel_efficiency':
            newStats.fuelEfficiency = upgrade.effect(currentLevel + 1);
            break;
          case 'fuel_capacity':
            newStats.fuelCapacity = upgrade.effect(currentLevel + 1);
            newStats.currentFuel = newStats.fuelCapacity;
            currentFuelRef.current = newStats.currentFuel;
            break;
          case 'coin_magnet':
            newStats.coinMagnet = upgrade.effect(currentLevel + 1);
            break;
          case 'shield':
            newStats.shieldDuration = upgrade.effect(currentLevel + 1);
            break;
          case 'double_coins':
            newStats.doubleCoins = true;
            break;
          case 'slow_motion':
            newStats.slowMotion = true;
            break;
        }
        
        return newStats;
      });
    }
  }, [coins]);
  
  const getUpgradeLevel = (upgradeId: string): number => {
    switch (upgradeId) {
      case 'jetpack_speed':
        return Math.floor((playerStats.jetpackSpeed - 1) / 0.2);
      case 'fuel_efficiency':
        return Math.floor((playerStats.fuelEfficiency - 1) / 0.15);
      case 'fuel_capacity':
        return Math.floor((playerStats.fuelCapacity - 100) / 50);
      case 'coin_magnet':
        return Math.floor(playerStats.coinMagnet / 50);
      case 'shield':
        return Math.floor(playerStats.shieldDuration / 2);
      case 'double_coins':
        return playerStats.doubleCoins ? 1 : 0;
      case 'slow_motion':
        return playerStats.slowMotion ? 1 : 0;
      default:
        return 0;
    }
  };

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
    'worklet';
    const gravity = GameConfig.GRAVITY;

    if (!hasStarted.value) {
      // Ensure player stays at ground level before game starts
      playerY.value = GROUND_LEVEL;
      playerVelocity.value = 0;
      hasReachedStaging.value = false;
    } else {
      if (isJetpackActive.value && currentFuelRef.current > 0) {
        const jetpackForce = gravity * playerStats.jetpackSpeed;
        playerVelocity.value -= jetpackForce * dt;
        
        // Consume fuel and sync both ref and state
        const fuelConsumption = (1 / playerStats.fuelEfficiency) * dt * 10;
        const nextFuel = Math.max(0, currentFuelRef.current - fuelConsumption);
        currentFuelRef.current = nextFuel;
        runOnJS(setPlayerStats)(prev => ({ ...prev, currentFuel: nextFuel }));
        
        // Update fuel availability for worklets
        hasFuel.value = nextFuel > 0;
        
        // Auto-deactivate jetpack when fuel depletes
        if (nextFuel <= 0) {
          isJetpackActive.value = false;
        }
      } else {
        playerVelocity.value += gravity * dt;
      }

      const newVelocity = Math.max(-GameConfig.MAX_VELOCITY, Math.min(GameConfig.MAX_VELOCITY, playerVelocity.value));
      const newPlayerY = playerY.value + playerVelocity.value * dt;
      playerVelocity.value = newVelocity;
      playerY.value = newPlayerY;
      if (playerY.value < GROUND_LEVEL) hasLiftedOff.value = true;
      
      // Only apply staging logic when game has started
      if (hasStarted.value) {
        // First, move player to staging height (halfway up screen)
        if (!hasReachedStaging.value && playerY.value > STAGING_HEIGHT) {
          playerY.value = STAGING_HEIGHT;
          playerVelocity.value = 0;
          hasReachedStaging.value = true;
        }
        
        // Then allow normal flight above staging height
        if (hasReachedStaging.value && playerY.value < TARGET_HEIGHT) {
          playerY.value = TARGET_HEIGHT;
          playerVelocity.value = Math.max(playerVelocity.value, 0);
        }
      }
      
      if (hasLiftedOff.value && playerY.value >= SCREEN_HEIGHT + 100 && playerVelocity.value >= 0) {
        playerY.value = GROUND_LEVEL;
        playerVelocity.value = 0;
        runOnJS(gameOver)();
        return;
      }
      
      // Game over if fuel depletes while flying
      if (hasLiftedOff.value && currentFuelRef.current <= 0 && playerY.value > GROUND_LEVEL) {
        runOnJS(gameOver)();
        return;
      }
    }

    const newPlayerX = playerX.value + controlDirection.value * GameConfig.HORIZONTAL_SPEED * dt;
    const clampedPlayerX = Math.max(0, Math.min(SCREEN_WIDTH - GameConfig.PLAYER_SIZE, newPlayerX));
    playerX.value = clampedPlayerX;
    
    // Update parallax speed based on player velocity (only when game has started)
    if (hasStarted.value) {
      if (isJetpackActive.value) {
        if (hasReachedStaging.value && playerY.value >= STAGING_HEIGHT) {
          playerY.value = STAGING_HEIGHT;
        }
        // Use player velocity to affect parallax speed
        const velocityFactor = Math.abs(playerVelocity.value) / GameConfig.MAX_VELOCITY;
        const dynamicScrollSpeed = GameConfig.SCROLL_SPEED * (0.5 + velocityFactor * 0.5);
        const newScrollOffset = scrollOffset.value + dynamicScrollSpeed * dt;
        scrollOffset.value = newScrollOffset;
      } else {
        const newPlayerY = playerY.value + gravity * dt;
        playerY.value = newPlayerY;
      }
    }

    // Update obstacles with optimized logic and collision detection
    const velocityFactor = Math.abs(playerVelocity.value) / GameConfig.MAX_VELOCITY;
    const dynamicScrollSpeed = GameConfig.SCROLL_SPEED * (0.5 + velocityFactor * 0.5);
    
    obstaclesRef.current.forEach(o => {
      o.y.value = o.y.value + dynamicScrollSpeed * dt;
    });
    const obs = obstaclesRef.current.filter(o => o.y.value > -100 && o.y.value < SCREEN_HEIGHT + 100);
    
    // Check obstacle collisions
    obs.forEach(obstacle => {
      if (obstacle.active.value) {
        const playerHitbox = {
          x: playerX.value + GameConfig.PLAYER_HITBOX.offsetX,
          y: playerY.value + GameConfig.PLAYER_HITBOX.offsetY,
          width: GameConfig.PLAYER_HITBOX.width,
          height: GameConfig.PLAYER_HITBOX.height,
        };
        
        // Adjust obstacle hitbox based on type for more accurate collision
        let obstacleHitbox;
        if (obstacle.type === 'laser') {
          // Laser has a thin hitbox
          obstacleHitbox = {
            x: obstacle.x.value,
            y: obstacle.y.value,
            width: obstacle.width,
            height: obstacle.height,
          };
        } else if (obstacle.type === 'bird') {
          // Bird has a smaller hitbox
          obstacleHitbox = {
            x: obstacle.x.value + 8,
            y: obstacle.y.value + 8,
            width: obstacle.width - 16,
            height: obstacle.height - 16,
          };
        } else {
          // Platform and blade have standard hitbox
          obstacleHitbox = {
            x: obstacle.x.value + 8,
            y: obstacle.y.value + 8,
            width: obstacle.width - 16,
            height: obstacle.height - 16,
          };
        }
        
        if (checkCollision(playerHitbox, obstacleHitbox)) {
          runOnJS(gameOver)();
          return;
        }
      }
    });
    
    if (Math.random() < GameConfig.OBSTACLE_SPAWN_RATE && hasStarted.value) {
      const currentDistance = derivedDistance.value;
      let obstacleType: 'platform' | 'blade' | 'laser' | 'bird' = 'platform';
      
      // Determine obstacle type based on altitude
      if (currentDistance < 5000) {
        // Low altitude: birds and drones
        obstacleType = Math.random() < 0.7 ? 'bird' : 'platform';
      } else if (currentDistance < 15000) {
        // Medium altitude: aircraft and weather balloons
        obstacleType = Math.random() < 0.6 ? 'blade' : 'platform';
      } else if (currentDistance < 50000) {
        // High altitude: military aircraft and satellites
        obstacleType = Math.random() < 0.5 ? 'laser' : 'blade';
      } else {
        // Space: space debris and meteoroids
        obstacleType = Math.random() < 0.8 ? 'laser' : 'blade';
      }
      
      const width = obstacleType === 'laser' ? 4 : 40;
      const height = obstacleType === 'laser' ? 200 : 100;
      const x = Math.random() * (SCREEN_WIDTH - width);
      
      const newObstacle: ObstacleType = {
        id: Date.now().toString(),
        type: obstacleType,
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

    // Update coins with optimized logic and collision detection
    // Use the same movement logic as clouds - only move when jetpack is active
    if (isJetpackActive.value && hasStarted.value) {
      const coinScrollSpeed = GameConfig.SCROLL_SPEED * (0.5 + velocityFactor * 0.5) * 0.3;
      coinsRef.current.forEach(c => {
        c.y.value = c.y.value + coinScrollSpeed * dt;
      });
    }
    const coinsList = coinsRef.current.filter(c => {
      const yValue = c.y.value;
      const collectedValue = c.collected.value;
      return yValue > -50 && yValue < SCREEN_HEIGHT + 50 && !collectedValue;
    });
    
    // Check coin collisions
    coinsList.forEach(coin => {
      if (!coin.collected.value) {
        const playerHitbox = {
          x: playerX.value + GameConfig.PLAYER_HITBOX.offsetX,
          y: playerY.value + GameConfig.PLAYER_HITBOX.offsetY,
          width: GameConfig.PLAYER_HITBOX.width,
          height: GameConfig.PLAYER_HITBOX.height,
        };
        
        const coinHitbox = {
          x: coin.x.value,
          y: coin.y.value,
          width: 30, // Match Coin component size
          height: 30, // Match Coin component size
        };
        
        if (checkCollision(playerHitbox, coinHitbox)) {
          const coinValue = playerStats.doubleCoins ? coin.value * 2 : coin.value;
          coin.collected.value = true;
          coins.value += coinValue;
        }
      }
    });
    
    // Spawn new coins
    if (Math.random() < GameConfig.COIN_SPAWN_RATE && hasStarted.value) {
      const currentDistance = derivedDistance.value;
      const x = Math.random() * (SCREEN_WIDTH - 30); // Match Coin component size
      
      // Determine coin type based on altitude
      let coinType: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' = 'bronze';
      const availableTypes = Object.entries(GameConfig.COIN_TYPES).filter(([_, config]) => 
        currentDistance >= config.minAltitude && currentDistance <= config.maxAltitude
      );
      
      if (availableTypes.length > 0) {
        // Weight the selection - higher value coins are rarer
        const weights = availableTypes.map(([type, config]) => {
          switch (type) {
            case 'bronze': return 50;
            case 'silver': return 30;
            case 'gold': return 15;
            case 'platinum': return 4;
            case 'diamond': return 1;
            default: return 10;
          }
        });
        
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < availableTypes.length; i++) {
          random -= weights[i];
          if (random <= 0) {
            coinType = availableTypes[i][0] as any;
            break;
          }
        }
      } else {
        // Fallback to bronze if no types available
        coinType = 'bronze';
      }
      
      const coinConfig = GameConfig.COIN_TYPES[coinType];
      const newCoin: CoinType = {
        id: `coin-${Date.now()}`,
        x: createSharedValue(x),
        y: createSharedValue(-30), // Spawn above screen
        collected: createBooleanSharedValue(false),
        active: createBooleanSharedValue(true),
        value: coinConfig.value,
        type: coinType
      };
      coinsList.push(newCoin);
    }
    
    coinsRef.current = coinsList;
    runOnJS(setCoinsList)(coinsList);
  }, [playerStats, gameOver, setObstacles, setCoinsList]);

  // Cross-platform gesture handling
  const panGesture = Gesture.Pan()
    .onStart((event) => {
      panStartX.value = playerX.value;
      // Only activate jetpack if there's fuel available
      if (hasFuel.value) {
        isJetpackActive.value = true;
      }
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
      
      // Keep jetpack active while touching, but only if there's fuel
      if (hasFuel.value) {
        isJetpackActive.value = true;
      } else {
        isJetpackActive.value = false;
      }
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
      // Only activate jetpack if there's fuel available
      if (hasFuel.value) {
        isJetpackActive.value = true;
      }
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
    .maxDistance(10) // Only trigger for short taps
    .maxDuration(500); // Only trigger for quick taps

  const combinedGesture = Gesture.Race(panGesture, tapGesture);

  // Simplified animated style
  const playerAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: withSpring(playerX.value, { damping: 20, stiffness: 200 }) },
        { translateY: displayY.value },
        { rotate: '0deg' },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {gameState === 'start' && <StartScreen onStart={startGame} onOpenStore={openStore} highScore={highScore} />}
      {gameState === 'playing' && (
        <GestureDetector gesture={combinedGesture}>
          <View style={styles.gameArea}>
            <GameScreen
              playerAnimatedStyle={playerAnimatedStyle}
              scrollOffset={scrollOffset}
              score={derivedScore}
              coins={coins}
              distance={derivedDistance}
              isJetpackActive={isJetpackActive}
              obstacles={obstacles}
              coinsList={coinsList}
              hudScore={hudScore}
              hudCoins={hudCoins}
              hudDistance={hudDistance}
              fuelPercentage={(playerStats.currentFuel / playerStats.fuelCapacity) * 100}
              playerStats={playerStats}
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
      {gameState === 'store' && (
        <StoreScreen
          onBack={closeStore}
          playerCoins={hudCoins}
          playerStats={playerStats}
          onPurchaseUpgrade={purchaseUpgrade}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gameArea: {
    flex: 1,
  },
});