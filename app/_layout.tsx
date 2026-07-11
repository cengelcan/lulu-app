import { DarkTheme, ThemeProvider } from "expo-router/react-navigation";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useNotificationResponse } from '@/hooks/use-notification-response';
import { useAuthDeepLink } from '@/hooks/use-auth-deep-link';
import { useFamilyMemberCloudSync } from '@/hooks/use-family-member-cloud-sync';
import { useFamilySharingRealtime } from '@/hooks/use-family-sharing-realtime';
import { useJoinDeepLink } from '@/hooks/use-join-deep-link';
import { useLanguageStore } from '@/stores/language.store';

export default function RootLayout() {
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);
  useNotificationResponse();
  useAuthDeepLink();
  useJoinDeepLink();
  useFamilyMemberCloudSync();
  useFamilySharingRealtime();

  useEffect(() => {
    void loadLanguage();
  }, [loadLanguage]);

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(setup)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="check-in" />
        <Stack.Screen name="check-in-success" />
        <Stack.Screen name="pet-profile" />
        <Stack.Screen name="edit-pet" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="family-sharing" />
        <Stack.Screen name="family" />
        <Stack.Screen name="join-family" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="records" />
        <Stack.Screen name="reminders" />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
            contentStyle: { flex: 1 },
          }}
        />
        <Stack.Screen name="paywall-preview" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
