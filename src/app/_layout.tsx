import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { D } from '@/constants/design';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: D.bg },
          headerTitleStyle: { fontWeight: '700', color: D.textPrimary },
          headerTintColor: D.textPrimary,
          contentStyle: { backgroundColor: D.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="try-on" options={{ presentation: 'fullScreenModal', title: '着せ替え' }} />
        <Stack.Screen name="avatar-creator" options={{ presentation: 'modal', title: 'アバター' }} />
        <Stack.Screen name="closet-form" options={{ presentation: 'modal', title: '服を登録' }} />
        <Stack.Screen name="wish-form" options={{ presentation: 'modal', title: '気になる服を登録' }} />
        <Stack.Screen name="item/[id]" options={{ title: 'アイテム' }} />
        <Stack.Screen name="wish/[id]" options={{ title: '気になる服' }} />
        <Stack.Screen name="outfit/[id]" options={{ title: 'コーデ' }} />
        <Stack.Screen name="compat/[id]" options={{ title: '相性チェック' }} />
      </Stack>
    </>
  );
}
