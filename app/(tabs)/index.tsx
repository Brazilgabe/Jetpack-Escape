import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import GameContainer from '@/components/game/GameContainer';

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <GameContainer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});