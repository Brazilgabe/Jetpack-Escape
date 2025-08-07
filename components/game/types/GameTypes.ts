export type GameState = 'start' | 'playing' | 'paused' | 'gameOver';

import type { SharedValue } from 'react-native-reanimated';

export interface Obstacle {
  id: string;
  type: 'platform' | 'blade' | 'laser' | 'bird';
  x: { value: number };
  y: { value: number };
  width: number;
  height: number;
  speed?: number;
  active: { value: boolean };
}

export interface Coin {
  id: string;
  x: { value: number };
  y: { value: number };
  collected: { value: boolean };
  active: { value: boolean };
}

export interface PowerUp {
  id: string;
  type: 'magnet' | 'shield' | 'slowTime';
  x: number;
  y: number;
  active: boolean;
}

export const GameConfig = {
  GRAVITY: 100,
  JETPACK_FORCE: 500,
  SCROLL_SPEED: 500,
  HORIZONTAL_SPEED: 300,
  // Player positioning
  GROUND_OFFSET: 90,
  TARGET_HEIGHT_RATIO: 1 / 3,
  STAGING_HEIGHT_RATIO: 1 / 2, // Halfway up the screen
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
}
