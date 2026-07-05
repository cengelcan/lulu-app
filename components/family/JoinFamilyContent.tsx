import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { FamilyHeroPlaceholder } from '@/components/family/FamilyHeroPlaceholder';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { markJoinRemindersPromptPending } from '@/storage/join-reminders-prompt.storage';
import {
  clearPendingFamilyJoinCode,
  getPendingFamilyJoinCode,
} from '@/storage/pending-family-join.storage';
import { setUserSetupPath } from '@/storage/setup-path.storage';
import { usePetStore } from '@/stores/pet.store';
import { useSetupStore } from '@/stores/setup.store';
import { useSharingStore } from '@/stores/sharing.store';
import { formatFamilyCode, normalizeFamilyCode } from '@/utils/sharing/family-code';
import { translateError } from '@/utils/translate-error';

type JoinFamilyContentProps = {
  showOwnerFallback?: boolean;
};

export function JoinFamilyContent({ showOwnerFallback = false }: JoinFamilyContentProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ code?: string | string[] }>();
  const initialCode = useMemo(() => {
    const raw = Array.isArray(params.code) ? params.code[0] : params.code;
    return raw ? normalizeFamilyCode(raw) : '';
  }, [params.code]);

  const joinFamily = useSharingStore((state) => state.joinFamily);
  const loadFamilyTab = useSharingStore((state) => state.loadFamilyTab);

  const [code, setCode] = useState(initialCode);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');

  useFocusEffect(
    useCallback(() => {
      void getPendingFamilyJoinCode().then((pendingCode) => {
        if (pendingCode) {
          setCode(pendingCode);
        }
      });
    }, [])
  );

  const handleJoin = async () => {
    setError(null);
    setIsJoining(true);

    try {
      await joinFamily(code);
      await clearPendingFamilyJoinCode();

      const pets = usePetStore.getState().pets;
      const nextActivePet = pets.find((entry) => entry.status !== 'deceased') ?? pets[0] ?? null;

      if (nextActivePet) {
        await usePetStore.getState().setActivePet(nextActivePet.id);
      }

      await loadFamilyTab();
      await markJoinRemindersPromptPending();

      if (showOwnerFallback) {
        router.replace('/(tabs)/home');
        return;
      }

      router.back();
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'errors.joinFamilyFailed');
    } finally {
      setIsJoining(false);
    }
  };

  const handleSwitchToOwner = () => {
    void setUserSetupPath('owner').then(() => {
      useSetupStore.getState().beginSetup('initial');
      router.replace('/(setup)/pet-type');
    });
  };

  return (
    <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
      <View style={styles.body}>
        <FamilyHeroPlaceholder icon="envelope.fill" size={140} />

        <ThemedText type="title" style={styles.headline}>
          {t('family.join.headline')}
        </ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.subheadline}>
          {t('family.join.subheadline')}
        </ThemedText>

        <TextInput
          accessibilityLabel={t('sharing.joinCodeA11y')}
          autoCapitalize="characters"
          autoCorrect={false}
          value={formatFamilyCode(code)}
          onChangeText={(value) => setCode(normalizeFamilyCode(value))}
          placeholder={t('family.join.codePlaceholder')}
          placeholderTextColor={textSecondaryColor}
          style={[styles.input, { color: textColor, borderColor, backgroundColor: surfaceColor }]}
        />

        {error ? <ThemedText style={styles.error}>{translateError(t, error)}</ThemedText> : null}

        <Button
          title={t('sharing.joinFamily')}
          onPress={() => void handleJoin()}
          disabled={isJoining || code.length < 4}
          trailingIcon={isJoining ? <ActivityIndicator color="#ffffff" size="small" /> : undefined}
        />

        {showOwnerFallback ? (
          <Button
            title={t('sharing.addOwnPetInstead')}
            variant="ghost"
            onPress={handleSwitchToOwner}
            style={styles.ownerFallback}
          />
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  body: {
    gap: Spacing.md,
    paddingTop: Spacing.lg,
  },
  headline: {
    textAlign: 'center',
  },
  subheadline: {
    textAlign: 'center',
    ...Typography.body,
    paddingHorizontal: Spacing.sm,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.title,
    letterSpacing: 6,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  error: {
    color: '#FF6B6B',
    textAlign: 'center',
    ...Typography.caption,
  },
  ownerFallback: {
    marginTop: Spacing.xs,
  },
});
