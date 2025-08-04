import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RotateCcw, Trophy, Coins, MapPin } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GameOverScreenProps {
  score: number;
  coins: number;
  distance: number;
  highScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
}

export default function GameOverScreen({
  score,
  coins,
  distance,
  highScore,
  isNewRecord,
  onRestart,
}: GameOverScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.blurOverlay} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.gameOverText}>GAME OVER</Text>
          {isNewRecord && (
            <View style={styles.newRecordBadge}>
              <Trophy size={20} color="#ffd93d" />
              <Text style={styles.newRecordText}>NEW RECORD!</Text>
            </View>
          )}
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Trophy size={24} color="#ff6b6b" />
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{score.toLocaleString()}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Coins size={24} color="#ffd93d" />
            <Text style={styles.statLabel}>Coins</Text>
            <Text style={styles.statValue}>{coins}</Text>
          </View>
          
          <View style={styles.statItem}>
            <MapPin size={24} color="#4ecdc4" />
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{distance}m</Text>
          </View>
        </View>
        
        <View style={styles.highScoreContainer}>
          <Text style={styles.highScoreLabel}>High Score</Text>
          <Text style={styles.highScoreValue}>{highScore.toLocaleString()}</Text>
        </View>
        
        <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
          <LinearGradient
            colors={['#4ecdc4', '#44a08d']}
            style={styles.restartButtonGradient}
          >
            <RotateCcw size={24} color="#ffffff" />
            <Text style={styles.restartButtonText}>PLAY AGAIN</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  blurOverlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  gameOverText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ff6b6b',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  newRecordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 217, 61, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#ffd93d',
  },
  newRecordText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffd93d',
    marginLeft: 6,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  highScoreContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  highScoreLabel: {
    fontSize: 16,
    color: '#a0a0a0',
    fontWeight: '600',
  },
  highScoreValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffd93d',
    marginTop: 5,
  },
  restartButton: {
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#4ecdc4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  restartButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginLeft: 10,
    letterSpacing: 1,
  },
});