import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function PetAgeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Pet Age Group</ThemedText>
      <ThemedText>Under 1 Year / 1-3 / 4-7 / 8-12 / 13+</ThemedText>
      <Pressable
        style={styles.button}
        onPress={() => router.push('/(setup)/health-conditions')}>
        <ThemedText type="defaultSemiBold">Continue</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  button: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});
