import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Coins } from 'lucide-react-native';
import { GameConfig, Upgrade, PlayerStats } from '@/components/game/types/GameTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StoreScreenProps {
  onBack: () => void;
  playerCoins: number;
  playerStats: PlayerStats;
  onPurchaseUpgrade: (upgradeId: string) => void;
}

export default function StoreScreen({ 
  onBack, 
  playerCoins, 
  playerStats, 
  onPurchaseUpgrade 
}: StoreScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'speed' | 'fuel' | 'utility' | 'defense'>('all');

  const categories = [
    { id: 'all', name: 'All', icon: '🏪' },
    { id: 'speed', name: 'Speed', icon: '🚀' },
    { id: 'fuel', name: 'Fuel', icon: '⛽' },
    { id: 'utility', name: 'Utility', icon: '🛠️' },
    { id: 'defense', name: 'Defense', icon: '🛡️' },
  ];

  const upgrades = Object.values(GameConfig.UPGRADES);
  const filteredUpgrades = selectedCategory === 'all' 
    ? upgrades 
    : upgrades.filter(upgrade => upgrade.category === selectedCategory);

  const getUpgradeLevel = (upgradeId: string): number => {
    switch (upgradeId) {
      case 'jetpack_speed':
        return Math.floor((playerStats.jetpackSpeed - 1) / 0.2);
      case 'fuel_efficiency':
        return Math.floor((playerStats.fuelEfficiency - 1) / 0.15);
      case 'coin_magnet':
        return Math.floor(playerStats.coinMagnet / 50);
      case 'shield':
        return Math.floor(playerStats.shieldDuration / 2);
      case 'double_coins':
        return playerStats.doubleCoins ? 1 : 0;
      case 'slow_motion':
        return playerStats.slowMotion ? 1 : 0;
      default:
        return 0;
    }
  };

  const getUpgradeCost = (upgrade: any, currentLevel: number): number => {
    return upgrade.baseCost * (currentLevel + 1);
  };

  const canAfford = (cost: number): boolean => {
    return playerCoins >= cost;
  };

  const isMaxLevel = (upgrade: any, currentLevel: number): boolean => {
    return currentLevel >= upgrade.maxLevel;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(26, 26, 46, .95)', '#1a1a2e']}
        style={styles.overlay}
      />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>STORE</Text>
        <View style={styles.coinDisplay}>
          <Coins size={20} color="#ffd93d" />
          <Text style={styles.coinText}>{playerCoins}</Text>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id as any)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.upgradesContainer} showsVerticalScrollIndicator={false}>
        {filteredUpgrades.map(upgrade => {
          const currentLevel = getUpgradeLevel(upgrade.id);
          const cost = getUpgradeCost(upgrade, currentLevel);
          const maxed = isMaxLevel(upgrade, currentLevel);
          const affordable = canAfford(cost);

          return (
            <View key={upgrade.id} style={styles.upgradeCard}>
              <View style={styles.upgradeHeader}>
                <Text style={styles.upgradeIcon}>{upgrade.icon}</Text>
                <View style={styles.upgradeInfo}>
                  <Text style={styles.upgradeName}>{upgrade.name}</Text>
                  <Text style={styles.upgradeDescription}>{upgrade.description}</Text>
                </View>
                <View style={styles.upgradeLevel}>
                  <Text style={styles.levelText}>Lv.{currentLevel}/{upgrade.maxLevel}</Text>
                </View>
              </View>
              
              <View style={styles.upgradeFooter}>
                <View style={styles.costContainer}>
                  <Coins size={16} color="#ffd93d" />
                  <Text style={[
                    styles.costText,
                    !affordable && styles.costTextInsufficient
                  ]}>
                    {cost}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.purchaseButton,
                    (!affordable || maxed) && styles.purchaseButtonDisabled
                  ]}
                  onPress={() => onPurchaseUpgrade(upgrade.id)}
                  disabled={!affordable || maxed}
                >
                  <Text style={[
                    styles.purchaseButtonText,
                    (!affordable || maxed) && styles.purchaseButtonTextDisabled
                  ]}>
                    {maxed ? 'MAXED' : 'PURCHASE'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  coinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 217, 61, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffd93d',
  },
  coinText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffd93d',
    marginLeft: 4,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    zIndex: 2,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    borderColor: '#ff6b6b',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  categoryTextActive: {
    color: '#ff6b6b',
  },
  upgradesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  upgradeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  upgradeDescription: {
    fontSize: 12,
    color: '#a0a0a0',
    lineHeight: 16,
  },
  upgradeLevel: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ecdc4',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ecdc4',
  },
  upgradeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffd93d',
    marginLeft: 4,
  },
  costTextInsufficient: {
    color: '#ff6b6b',
  },
  purchaseButton: {
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  purchaseButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  purchaseButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  purchaseButtonTextDisabled: {
    color: '#a0a0a0',
  },
});
