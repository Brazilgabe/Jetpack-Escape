import { Tabs } from 'expo-router';
import { Gamepad as GamepadIcon } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide tab bar for game
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Game',
          tabBarIcon: ({ size, color }) => (
            <GamepadIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}