import { Stack } from 'expo-router';

import { SettingsScreenContent } from '@/components/settings/SettingsScreenContent';

export default function SettingsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Settings' }} />
      <SettingsScreenContent edges={['bottom']} />
    </>
  );
}
