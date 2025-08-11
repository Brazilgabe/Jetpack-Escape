import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Coins, MapPin, Zap } from 'lucide-react-native';

interface GameHUDProps {
  scoreValue: number;
  coinsValue: number;
  distanceValue: number;
  fuelPercentage?: number;
  playerStats?: {
    jetpackSpeed: number;
    fuelEfficiency: number;
    coinMagnet: number;
    shieldDuration: number;
    doubleCoins: boolean;
    slowMotion: boolean;
  };
}

export default function GameHUD({ scoreValue, coinsValue, distanceValue, fuelPercentage, playerStats }: GameHUDProps) {
  const [showUpgradeNotification, setShowUpgradeNotification] = useState(false);
  const notificationOpacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (playerStats?.doubleCoins || (playerStats?.jetpackSpeed && playerStats.jetpackSpeed > 1)) {
      setShowUpgradeNotification(true);
      Animated.sequence([
        Animated.timing(notificationOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(notificationOpacity, {
          toValue: 0,
          duration: 500,
          delay: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => setShowUpgradeNotification(false));
    }
  }, [playerStats?.doubleCoins, playerStats?.jetpackSpeed]);



  return (
    <View style={styles.container}>
      <View style={styles.hudContainer}>
        <View style={styles.statItem}>
          <Trophy size={20} color="#ff6b6b" />
          <Text style={styles.statValue}>
            {scoreValue.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.statItem, playerStats?.doubleCoins && styles.upgradedItem]}>
          <Coins size={20} color={playerStats?.doubleCoins ? "#ffd700" : "#ffd93d"} />
          <Text style={styles.statValue}>
            {coinsValue.toString()}
          </Text>
          {playerStats?.doubleCoins && (
            <View style={styles.upgradeIndicator}>
              <Text style={styles.upgradeText}>2x</Text>
            </View>
          )}
        </View>

        <View style={styles.statItem}>
          <MapPin size={20} color="#4ecdc4" />
          <Text style={styles.statValue}>
            {`${Math.floor(distanceValue)}m`}
          </Text>
        </View>

        {/* Fuel Gauge - Now part of the main HUD row */}
        {fuelPercentage !== undefined && (
          <View style={styles.fuelGauge}>
            <Text style={styles.fuelCanIcon}>⛽</Text>
            <View style={styles.fuelBar}>
              <View 
                style={[
                  styles.fuelFill, 
                  { 
                    width: `${fuelPercentage}%`,
                    backgroundColor: fuelPercentage > 60 ? '#4ecdc4' : fuelPercentage > 30 ? '#ffa500' : '#ff6b6b'
                  }
                ]} 
              />
            </View>
            <Text style={styles.fuelText}>{`${Math.floor(fuelPercentage)}%`}</Text>
          </View>
        )}
      </View>

      {/* Upgrade Notification */}
      {showUpgradeNotification && (
        <Animated.View style={[styles.upgradeNotification, { opacity: notificationOpacity }]}>
          <Zap size={16} color="#ffd700" />
          <Text style={styles.upgradeNotificationText}>Upgrade Active!</Text>
        </Animated.View>
      )}
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
  
  // Simple Fuel Gauge - Matching HUD Style
  fuelGauge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    width: 135,
  },
  fuelCanIcon: {
    fontSize: 16,
    color: '#ffffff',
    marginRight: 6,
  },
  fuelBar: {
    width: 40,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 6,
  },
  fuelFill: {
    height: '100%',
    borderRadius: 4,
  },
  fuelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  upgradedItem: {
    borderColor: '#ffd700',
    borderWidth: 2,
  },
  upgradeIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffd700',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  upgradeNotification: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeNotificationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
  },
});