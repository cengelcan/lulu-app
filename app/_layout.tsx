import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { configureNotificationHandler } from '@/services/notifications';

configureNotificationHandler();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(setup)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="check-in" />
        <Stack.Screen name="check-in-success" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
