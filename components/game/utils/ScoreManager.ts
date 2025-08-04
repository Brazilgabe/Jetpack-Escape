import AsyncStorage from '@react-native-async-storage/async-storage';

export class ScoreManager {
  private static HIGH_SCORE_KEY = 'jetpack_escape_high_score';
  private static TOTAL_COINS_KEY = 'jetpack_escape_total_coins';

  static async getHighScore(): Promise<number> {
    try {
      const score = await AsyncStorage.getItem(this.HIGH_SCORE_KEY);
      return score ? parseInt(score, 10) : 0;
    } catch (error) {
      console.error('Error getting high score:', error);
      return 0;
    }
  }

  static async setHighScore(score: number): Promise<void> {
    try {
      await AsyncStorage.setItem(this.HIGH_SCORE_KEY, score.toString());
    } catch (error) {
      console.error('Error setting high score:', error);
    }
  }

  static async getTotalCoins(): Promise<number> {
    try {
      const coins = await AsyncStorage.getItem(this.TOTAL_COINS_KEY);
      return coins ? parseInt(coins, 10) : 0;
    } catch (error) {
      console.error('Error getting total coins:', error);
      return 0;
    }
  }

  static async addCoins(amount: number): Promise<void> {
    try {
      const currentCoins = await this.getTotalCoins();
      await AsyncStorage.setItem(this.TOTAL_COINS_KEY, (currentCoins + amount).toString());
    } catch (error) {
      console.error('Error adding coins:', error);
    }
  }

  static calculateScore(distance: number, coinsCollected: number, timeAlive: number): number {
    return Math.floor(distance * 10 + coinsCollected * 50 + timeAlive * 5);
  }
}