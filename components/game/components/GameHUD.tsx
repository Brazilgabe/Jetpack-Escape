import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Coins, MapPin } from 'lucide-react-native';

interface GameHUDProps {
  scoreValue: number;
  coinsValue: number;
  distanceValue: number;
}

export default function GameHUD({ scoreValue, coinsValue, distanceValue }: GameHUDProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.8)', 'transparent']}
        style={styles.topGradient}
      />

      <View style={styles.hudContainer}>
        <View style={styles.statItem}>
          <Trophy size={20} color="#ff6b6b" />
          <Text style={styles.statValue}>
            {scoreValue.toLocaleString()}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Coins size={20} color="#ffd93d" />
          <Text style={styles.statValue}>
            {coinsValue.toString()}
          </Text>
        </View>

        <View style={styles.statItem}>
          <MapPin size={20} color="#4ecdc4" />
          <Text style={styles.statValue}>
            {`${Math.floor(distanceValue)}m`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  topGradient: {
    height: 120,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  hudContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 6,
  },
});