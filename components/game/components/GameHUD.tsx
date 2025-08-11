import React, { useState, useEffect } from 'react';
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
      {/* <LinearGradient
        colors={['rgba(0, 0, 0, 0.3)', 'transparent']}
        style={styles.topGradient}
      /> */}

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
      </View>
      
      {/* Fuel Gauge */}
      {fuelPercentage !== undefined && (
        <View style={styles.fuelGauge}>
          <View style={styles.fuelIconContainer}>
            <Zap size={16} color={fuelPercentage > 20 ? '#4ecdc4' : '#ff6b6b'} />
          </View>
          <View style={styles.fuelBarContainer}>
            <View style={styles.fuelBar}>
              <View 
                style={[
                  styles.fuelFill, 
                  { 
                    width: `${fuelPercentage}%`,
                    backgroundColor: fuelPercentage > 20 ? '#4ecdc4' : fuelPercentage > 10 ? '#ffa500' : '#ff6b6b'
                  }
                ]} 
              />
            </View>
            <Text style={styles.fuelText}>{`${Math.floor(fuelPercentage)}%`}</Text>
          </View>
        </View>
      )}

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
  // topGradient: {
  //   height: 120,
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   right: 0,
  // },
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
  fuelGauge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fuelIconContainer: {
    marginRight: 8,
  },
  fuelBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  fuelBar: {
    width: 120,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fuelFill: {
    height: '100%',
    borderRadius: 4,
  },
  fuelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
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