import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotificationResponse } from '@/hooks/use-notification-response';
import { configureNotificationHandler } from '@/services/notifications';
import { useAppearanceStore } from '@/stores/appearance.store';
import { useLanguageStore } from '@/stores/language.store';

configureNotificationHandler();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const loadAppearance = useAppearanceStore((state) => state.loadAppearance);
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);
  useNotificationResponse();

  useEffect(() => {
    void loadAppearance();
    void loadLanguage();
  }, [loadAppearance, loadLanguage]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
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
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
