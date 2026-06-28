import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { SetupCompleteHero } from '@/components/setup/SetupCompleteHero';
import { SetupCompletePetCard } from '@/components/setup/SetupCompletePetCard';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { usePetStore } from '@/stores/pet.store';

export default function SetupCompleteScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const pet = usePetStore((state) => state.pet);
  const isLoading = usePetStore((state) => state.isLoading);
  const loadPet = usePetStore((state) => state.loadPet);

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  useEffect(() => {
    if (!isLoading && !pet) {
      router.replace('/(tabs)/home');
    }
  }, [isLoading, pet, router]);

  const handleStartCheckIn = useCallback(() => {
    router.replace('/check-in?fromSetup=1');
  }, [router]);

  if (isLoading || !pet) {
    return (
      <ScreenContainer contentStyle={styles.centered}>
        <ActivityIndicator color={primaryColor} size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable contentStyle={styles.content}>
      <View style={styles.body}>
        <SetupCompleteHero />

        <View style={styles.headline}>
          <ThemedText type="title" style={styles.title}>
            {t('setup.complete.title')}
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            {t('setup.complete.subtitle')}
          </ThemedText>
        </View>

        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.prompt}>
          {t('setup.complete.checkInPrompt', { name: pet.name })}
        </ThemedText>

        <SetupCompletePetCard pet={pet} />
      </View>

      <View style={styles.footer}>
        <Button
          title={t('setup.complete.startFirstCheckIn')}
          onPress={handleStartCheckIn}
          style={styles.button}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  headline: {
    gap: Spacing.xxs,
  },
  title: {
    textAlign: 'center',
    ...Typography.title,
  },
  prompt: {
    textAlign: 'center',
    ...Typography.body,
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
  },
  button: {
    borderRadius: Radius.pill,
    minHeight: 52,
    marginBottom: Spacing.md,
  },
});
