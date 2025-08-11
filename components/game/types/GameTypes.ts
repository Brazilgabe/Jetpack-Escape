export type GameState = 'start' | 'playing' | 'paused' | 'gameOver' | 'store';

import type { SharedValue } from 'react-native-reanimated';

export interface Obstacle {
  id: string;
  type: 'platform' | 'blade' | 'laser' | 'bird';
  x: SharedValue<number>;
  y: SharedValue<number>;
  width: number;
  height: number;
  speed?: number;
  active: SharedValue<boolean>;
}

export interface Coin {
  id: string;
  x: SharedValue<number>;
  y: SharedValue<number>;
  collected: SharedValue<boolean>;
  active: SharedValue<boolean>;
  value: number;
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

export interface PowerUp {
  id: string;
  type: 'magnet' | 'shield' | 'slowTime';
  x: number;
  y: number;
  active: boolean;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  currentLevel: number;
  effect: (level: number) => number;
  category: 'speed' | 'fuel' | 'utility' | 'defense';
  icon: string;
}

export interface PlayerStats {
  jetpackSpeed: number;
  fuelEfficiency: number;
  coinMagnet: number;
  shieldDuration: number;
  doubleCoins: boolean;
  slowMotion: boolean;
  fuelCapacity: number;
  currentFuel: number;
}

export const GameConfig = {
  GRAVITY: 700,
  SCROLL_SPEED: 800,
  HORIZONTAL_SPEED: 300,
  // Player positioning
  GROUND_OFFSET: 90,
  TARGET_HEIGHT_RATIO: 1 / 3,
  STAGING_HEIGHT_RATIO: 1 / 1.8, // Halfway up the screen
  PLAYER_SIZE: 60,
  COIN_SIZE: 30,
  // Dimensions of the player's hitbox used for accurate collision detection
  PLAYER_HITBOX: {
    width: 40,
    height: 50,
    offsetX: 10,
    offsetY: 5,
  },
  // Limits vertical speed for smoother movement
  MAX_VELOCITY: 400,
  OBSTACLE_SPAWN_RATE: 0.05,
  OBSTACLE_SPEED: 200,
  COIN_SPAWN_RATE: 0.12,
  // Coin configuration
  COIN_TYPES: {
    bronze: { value: 1, minAltitude: 0, maxAltitude: 10000, color: '#cd7f32' },
    silver: { value: 10, minAltitude: 5000, maxAltitude: 25000, color: '#c0c0c0' },
    gold: { value: 50, minAltitude: 15000, maxAltitude: 50000, color: '#ffd700' },
    platinum: { value: 100, minAltitude: 30000, maxAltitude: 80000, color: '#e5e4e2' },
    diamond: { value: 1000, minAltitude: 60000, maxAltitude: 999999, color: '#b9f2ff' },
  },
  // Distance at which difficulty scales
  DIFFICULTY_DISTANCE: 5000,
  // Store configuration
  UPGRADES: {
    JETPACK_SPEED: {
      id: 'jetpack_speed',
      name: 'Jetpack Speed',
      description: 'Increase jetpack thrust power',
      baseCost: 100,
      maxLevel: 5,
      effect: (level: number) => 1 + (level * 0.2),
      category: 'speed' as const,
      icon: '🚀',
    },
    FUEL_EFFICIENCY: {
      id: 'fuel_efficiency',
      name: 'Fuel Efficiency',
      description: 'Reduce fuel consumption rate',
      baseCost: 150,
      maxLevel: 5,
      effect: (level: number) => 1 + (level * 0.15),
      category: 'fuel' as const,
      icon: '⛽',
    },
    FUEL_CAPACITY: {
      id: 'fuel_capacity',
      name: 'Fuel Tank',
      description: 'Increase fuel capacity',
      baseCost: 200,
      maxLevel: 3,
      effect: (level: number) => 100 + (level * 50),
      category: 'fuel' as const,
      icon: '🛢️',
    },
    COIN_MAGNET: {
      id: 'coin_magnet',
      name: 'Coin Magnet',
      description: 'Auto-collect coins within range',
      baseCost: 200,
      maxLevel: 3,
      effect: (level: number) => level * 50,
      category: 'utility' as const,
      icon: '🧲',
    },
    SHIELD: {
      id: 'shield',
      name: 'Shield',
      description: 'Temporary invincibility after collision',
      baseCost: 300,
      maxLevel: 3,
      effect: (level: number) => level * 2,
      category: 'defense' as const,
      icon: '🛡️',
    },
    DOUBLE_COINS: {
      id: 'double_coins',
      name: 'Double Coins',
      description: 'Collect 2x coins',
      baseCost: 500,
      maxLevel: 1,
      effect: () => 2,
      category: 'utility' as const,
      icon: '💰',
    },
    SLOW_MOTION: {
      id: 'slow_motion',
      name: 'Slow Motion',
      description: 'Slow down time for easier navigation',
      baseCost: 400,
      maxLevel: 1,
      effect: () => 0.5,
      category: 'utility' as const,
      icon: '⏰',
    },
  },
};

export interface GameProps {
  playerAnimatedStyle: any;
  scrollOffset: any;
  score: SharedValue<number>;
  coins: SharedValue<number>;
  distance: SharedValue<number>;
  isJetpackActive: any;
  obstacles: Obstacle[];
  // Coins currently on screen
  coinsList: Coin[];
  // HUD values (optional for backward compatibility)
  hudScore?: number;
  hudCoins?: number;
  hudDistance?: number;
  fuelPercentage?: number;
  playerStats?: PlayerStats;
}
