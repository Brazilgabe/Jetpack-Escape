export type GameState = 'start' | 'playing' | 'paused' | 'gameOver';

export interface Obstacle {
  id: string;
  type: 'platform' | 'blade' | 'laser' | 'bird';
  x: number;
  y: number;
  width: number;
  height: number;
  speed?: number;
  rotation?: number;
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  collected: boolean;
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
  JETPACK_FORCE: 1200,
  SCROLL_SPEED: 200,
  PLAYER_SIZE: 60,
  COIN_SIZE: 30,
  MAX_VELOCITY: 15,
  OBSTACLE_SPAWN_RATE: 0.02,
  COIN_SPAWN_RATE: 0.03,
};

export interface GameProps {
  playerAnimatedStyle: any;
  scrollOffset: any;
  score: number;
  coins: number;
  distance: number;
  isJetpackActive: any;
}