import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { setOnboardingCompleted } from '@/storage/prefs.storage';
import { setUserSetupPath } from '@/storage/setup-path.storage';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useSetupStore } from '@/stores/setup.store';
import { useUserStore } from '@/stores/user.store';
import { needsDisplayNameForJoinFromStore } from '@/utils/join-display-name';

type PathOptionProps = {
  title: string;
  description: string;
  icon: 'pawprint.fill' | 'person.2.fill';
  onPress: () => void;
};

function PathOption({ title, description, icon, onPress }: PathOptionProps) {
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        { borderColor, backgroundColor: surfaceColor, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: `${brandAccentColor}22` }]}>
        <IconSymbol name={icon} size={24} color={brandAccentColor} />
      </View>
      <View style={styles.optionText}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor} style={styles.optionDescription}>
          {description}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
    </Pressable>
  );
}

export default function PathChoiceScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const handleOwner = useCallback(async () => {
    await setUserSetupPath('owner');
    useSetupStore.getState().beginSetup('initial');
    router.replace('/(setup)/pet-type');
  }, [router]);

  const handleJoin = useCallback(async () => {
    await setUserSetupPath('join_family');
    await setOnboardingCompleted(true);
    useOnboardingStore.setState({ hasCompletedOnboarding: true });

    await useUserStore.getState().loadUserProfile();

    if (needsDisplayNameForJoinFromStore()) {
      router.replace('/(setup)/join-display-name' as Href);
      return;
    }

    router.replace('/join-family');
  }, [router]);

  return (
    <ScreenContainer scrollable contentStyle={styles.content}>
      <View style={styles.body}>
        <ThemedText type="title" style={styles.title}>
          {t('setup.pathChoice.title')}
        </ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.description}>
          {t('setup.pathChoice.description')}
        </ThemedText>

        <View style={styles.options}>
          <PathOption
            title={t('setup.pathChoice.ownerTitle')}
            description={t('setup.pathChoice.ownerDescription')}
            icon="pawprint.fill"
            onPress={() => void handleOwner()}
          />
          <PathOption
            title={t('setup.pathChoice.joinTitle')}
            description={t('setup.pathChoice.joinDescription')}
            icon="person.2.fill"
            onPress={() => void handleJoin()}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  body: {
    flex: 1,
    gap: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    ...Typography.body,
  },
  options: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    minHeight: 88,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    gap: Spacing.xxs,
  },
  optionDescription: {
    ...Typography.caption,
  },
});
