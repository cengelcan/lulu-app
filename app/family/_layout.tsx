import { HeaderBackButton } from "expo-router/react-navigation";
import { Stack, useRouter } from 'expo-router';

import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function FamilyStackLayout() {
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <Stack
      screenOptions={{
        ...STACK_BACK_ONLY_OPTIONS,
        headerShown: true,
        headerLeft: () => (
          <HeaderBackButton tintColor={primaryColor} onPress={() => router.back()} />
        ),
      }}>
      <Stack.Screen name="create" />
      <Stack.Screen name="join" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="members" />
    </Stack>
  );
}
