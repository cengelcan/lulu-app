import { Stack } from 'expo-router';

export default function SetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Keep wizard steps mounted so back navigation preserves form state.
        detachInactiveScreens: false,
      }}
    />
  );
}
