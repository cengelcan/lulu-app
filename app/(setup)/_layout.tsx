import { Stack } from 'expo-router';

export default function SetupLayout() {
  return (
    // Wizard step form state lives in useSetupStore, so it survives navigation.
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
