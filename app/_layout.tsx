import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useNotificationResponse } from '@/hooks/use-notification-response';
import { useAuthDeepLink } from '@/hooks/use-auth-deep-link';
import { configureNotificationHandler } from '@/services/notifications';
import { useLanguageStore } from '@/stores/language.store';

configureNotificationHandler();

export default function RootLayout() {
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);
  useNotificationResponse();
  useAuthDeepLink();

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
        <Stack.Screen name="reports" />
        <Stack.Screen name="records" />
        <Stack.Screen name="reminders" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
