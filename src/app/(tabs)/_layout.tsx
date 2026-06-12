import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { D } from '@/constants/design';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: D.bg },
        headerTitleStyle: { fontWeight: '700', color: D.textPrimary },
        tabBarActiveTintColor: D.textPrimary,
        tabBarInactiveTintColor: D.textSecondary,
        tabBarStyle: { backgroundColor: D.surface, borderTopColor: D.border },
        sceneStyle: { backgroundColor: D.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ルーム',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="closet"
        options={{
          title: 'クローゼット',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👕" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: 'コーデ',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✨" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'ほしい物',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛍️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
