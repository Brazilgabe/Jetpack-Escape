import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Rocket, Trophy } from 'lucide-react-native';
import { useSharedValue } from 'react-native-reanimated';
import ParallaxBackground from '@/components/game/screens/ParallaxBackground';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StartScreenProps {
  onStart: () => void;
  onOpenStore: () => void;
  highScore: number;
  totalCoins: number;
  isDataLoaded: boolean;
}

export default function StartScreen({ onStart, onOpenStore, highScore, totalCoins, isDataLoaded }: StartScreenProps) {
  const staticScrollOffset = useSharedValue(0);

  return (
    <View style={styles.container}>
      <ParallaxBackground scrollOffset={staticScrollOffset} />
      
      <LinearGradient
        colors={['rgba(26, 26, 46, .9)', '#1a1a2e']}
        style={styles.overlay}
      />
      
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Rocket size={60} color="#ff6b6b" />
          <Text style={styles.title}>JETPACK</Text>
          <Text style={styles.subtitle}>ESCAPE</Text>
        </View>
        
        {highScore > 0 && (
          <View style={styles.highScoreContainer}>
            <Trophy size={24} color="#ffd93d" />
            <Text style={styles.highScoreText}>Best: {highScore.toLocaleString()}</Text>
          </View>
        )}
        
        {totalCoins > 0 && (
          <View style={styles.totalCoinsContainer}>
            <Text style={styles.totalCoinsText}>Total Coins: {totalCoins.toLocaleString()}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.playButton, !isDataLoaded && styles.playButtonDisabled]} 
          onPress={onStart}
          disabled={!isDataLoaded}
        >
          <LinearGradient
            colors={isDataLoaded ? ['#ff6b6b', '#ee5a24'] : ['#666', '#444']}
            style={styles.playButtonGradient}
          >
            <Text style={[styles.playButtonText, !isDataLoaded && styles.playButtonTextDisabled]}>
              {isDataLoaded ? 'TAP TO PLAY' : 'LOADING...'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.storeButton} onPress={onOpenStore}>
          <LinearGradient
            colors={['#4ecdc4', '#44a08d']}
            style={styles.storeButtonGradient}
          >
            <Text style={styles.storeButtonText}>STORE</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.instructions}>
          Hold to ascend • Release to descend
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    paddingHorizontal: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ff6b6b',
    letterSpacing: 8,
    marginTop: -5,
  },
  highScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 217, 61, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#ffd93d',
  },
  highScoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffd93d',
    marginLeft: 8,
  },
  totalCoinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4ecdc4',
  },
  totalCoinsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ecdc4',
  },
  playButton: {
    marginBottom: 40,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButtonGradient: {
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
  },
  playButtonDisabled: {
    opacity: 0.6,
  },
  playButtonTextDisabled: {
    color: '#999',
  },
  storeButton: {
    marginBottom: 20,
    borderRadius: 25,
    elevation: 6,
    shadowColor: '#4ecdc4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  storeButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  storeButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
  },
  instructions: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 24,
  },
});