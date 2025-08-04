export type GameState = 'start' | 'playing' | 'paused' | 'gameOver';

import type { SharedValue } from 'react-native-reanimated';

export interface Obstacle {
  id: string;
  type: 'platform' | 'blade' | 'laser' | 'bird';
  x: SharedValue<number>;
  y: SharedValue<number>;
  width: number;
  height: number;
  speed?: number;
}

export interface Coin {
  id: string;
  x: SharedValue<number>;
  y: SharedValue<number>;
  collected: SharedValue<boolean>;
}

export interface PowerUp {
  id: string;
  type: 'magnet' | 'shield' | 'slowTime';
  x: number;
  y: number;
  active: boolean;
}

export const GameConfig = {
  GRAVITY: 800,
  JETPACK_FORCE: 2000,
  SCROLL_SPEED: 200,
  HORIZONTAL_SPEED: 300,
  // Player positioning
  GROUND_OFFSET: 90,
  TARGET_HEIGHT_RATIO: 1 / 3,
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
  OBSTACLE_SPAWN_RATE: 0.02,
  OBSTACLE_SPEED: 150,
  COIN_SPAWN_RATE: 0.03,
  // Distance at which difficulty scales
  DIFFICULTY_DISTANCE: 5000,
};

export interface GameProps {
  playerAnimatedStyle: any;
  scrollOffset: any;
  score: number;
  coins: number;
  distance: number;
  isJetpackActive: any;
  obstacles: SharedValue<Obstacle[]>;
  // Coins currently on screen
  coinsList: SharedValue<Coin[]>;
}
