import { GameConfig } from '../types/GameTypes';

export class GamePhysics {
  static applyGravity(velocity: number, deltaTime: number): number {
    return velocity - (GameConfig.GRAVITY * deltaTime * 0.001);
  }

  static applyJetpack(velocity: number, deltaTime: number): number {
    return velocity + (GameConfig.JETPACK_FORCE * deltaTime * 0.001);
  }

  static limitVelocity(velocity: number): number {
    return Math.max(-GameConfig.MAX_VELOCITY, Math.min(GameConfig.MAX_VELOCITY, velocity));
  }

  static checkCollision(
    playerX: number,
    playerY: number,
    playerSize: number,
    objectX: number,
    objectY: number,
    objectWidth: number,
    objectHeight: number
  ): boolean {
    return (
      playerX < objectX + objectWidth &&
      playerX + playerSize > objectX &&
      playerY < objectY + objectHeight &&
      playerY + playerSize > objectY
    );
  }

  static generateRandomObstacle(screenWidth: number, screenHeight: number) {
    const types = ['platform', 'blade', 'laser', 'bird'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: Math.random().toString(),
      type,
      x: screenWidth + Math.random() * 200,
      y: Math.random() * (screenHeight - 100),
      width: type === 'platform' ? 80 + Math.random() * 40 : 40,
      height: type === 'laser' ? 200 + Math.random() * 100 : 20,
      speed: 100 + Math.random() * 50,
    };
  }

  static generateRandomCoin(screenWidth: number, screenHeight: number) {
    return {
      id: Math.random().toString(),
      x: screenWidth + Math.random() * 100,
      y: Math.random() * (screenHeight - 60),
      collected: false,
    };
  }
}