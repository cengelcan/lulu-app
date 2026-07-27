import * as SystemUI from 'expo-system-ui';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useNotificationResponse } from '@/hooks/use-notification-response';
import { useAuthDeepLink } from '@/hooks/use-auth-deep-link';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFamilyMemberCloudSync } from '@/hooks/use-family-member-cloud-sync';
import { useFamilySharingRealtime } from '@/hooks/use-family-sharing-realtime';
import { useJoinDeepLink } from '@/hooks/use-join-deep-link';
import { useExperiencePreferencesStore } from '@/stores/experience-preferences.store';
import { useLanguageStore } from '@/stores/language.store';

export default function RootLayout() {
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);
  const loadPreferences = useExperiencePreferencesStore((state) => state.loadPreferences);
  const colorScheme = useColorScheme();
  useNotificationResponse();
  useAuthDeepLink();
  useJoinDeepLink();
  useFamilyMemberCloudSync();
  useFamilySharingRealtime();

  useEffect(() => {
    void loadLanguage();
    void loadPreferences();
  }, [loadLanguage, loadPreferences]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(Colors[colorScheme].background);
  }, [colorScheme]);

  const navigationTheme = useMemo(() => {
    const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    const colors = Colors[colorScheme];

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: colors.brandAccent,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [colorScheme]);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
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
        <Stack.Screen name="family-activity" />
        <Stack.Screen name="join-family" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="records" />
        <Stack.Screen name="reminders" />
        <Stack.Screen name="medications" />
        <Stack.Screen name="vet-visits" />
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
      <StatusBar animated style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
