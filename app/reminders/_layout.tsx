import { Stack } from 'expo-router';

import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';

export default function RemindersLayout() {
  return (
    <Stack screenOptions={{ ...STACK_BACK_ONLY_OPTIONS, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[type]" />
      <Stack.Screen name="completed" />
    </Stack>
  );
}
