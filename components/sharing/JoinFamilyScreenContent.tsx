import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { GroupedSection } from '@/components/pet/GroupedSection';
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
import type { FamilyJoinPreview } from '@/types/sharing';
import { formatFamilyCode, normalizeFamilyCode } from '@/utils/sharing/family-code';
import { translateError } from '@/utils/translate-error';

type JoinFamilyScreenContentProps = {
  edges?: Edge[];
  showOwnerFallback?: boolean;
};

export function JoinFamilyScreenContent({
  edges = ['bottom'],
  showOwnerFallback = false,
}: JoinFamilyScreenContentProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ code?: string | string[] }>();
  const initialCode = useMemo(() => {
    const raw = Array.isArray(params.code) ? params.code[0] : params.code;
    return raw ? normalizeFamilyCode(raw) : '';
  }, [params.code]);

  const previewJoin = useSharingStore((state) => state.previewJoin);
  const joinFamily = useSharingStore((state) => state.joinFamily);
  const memberships = useSharingStore((state) => state.memberships);
  const loadMemberMemberships = useSharingStore((state) => state.loadMemberMemberships);
  const leaveFamily = useSharingStore((state) => state.leaveFamily);
  const isLoading = useSharingStore((state) => state.isLoading);

  const [code, setCode] = useState(initialCode);
  const [preview, setPreview] = useState<FamilyJoinPreview | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  const familyGroupIds = useMemo(
    () => [...new Set(memberships.map((membership) => membership.familyGroupId))],
    [memberships]
  );

  useFocusEffect(
    useCallback(() => {
      void loadMemberMemberships();
      void getPendingFamilyJoinCode().then((pendingCode) => {
        if (pendingCode) {
          setCode(pendingCode);
        }
      });
    }, [loadMemberMemberships])
  );

  const handlePreview = async () => {
    setError(null);
    setIsPreviewLoading(true);

    try {
      const nextPreview = await previewJoin(code);
      setPreview(nextPreview);
    } catch (previewError) {
      setPreview(null);
      setError(previewError instanceof Error ? previewError.message : 'errors.invalidFamilyCode');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleJoin = async () => {
    setError(null);
    setIsJoining(true);

    try {
      await joinFamily(code);
      await clearPendingFamilyJoinCode();

      const pets = usePetStore.getState().pets;
      const nextActivePet =
        pets.find((entry) => entry.status !== 'deceased') ?? pets[0] ?? null;

      if (nextActivePet) {
        await usePetStore.getState().setActivePet(nextActivePet.id);
      }

      await markJoinRemindersPromptPending();
      router.replace('/(tabs)/home');
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

  const handleLeave = (familyGroupId: string) => {
    Alert.alert(t('sharing.leaveTitle'), t('sharing.leaveMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('sharing.leaveConfirm'),
        style: 'destructive',
        onPress: () => {
          void leaveFamily(familyGroupId).catch((leaveError) => {
            Alert.alert(
              t('sharing.errorTitle'),
              translateError(
                t,
                leaveError instanceof Error ? leaveError.message : 'errors.leaveFamilyFailed'
              ) ?? t('errors.leaveFamilyFailed')
            );
          });
        },
      },
    ]);
  };

  return (
    <ScreenContainer scrollable edges={edges} contentStyle={styles.content}>
      <View style={styles.body}>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.intro}>
          {t('sharing.joinIntro')}
        </ThemedText>

        <GroupedSection title={t('sharing.joinCodeSection')}>
          <TextInput
            accessibilityLabel={t('sharing.joinCodeA11y')}
            autoCapitalize="characters"
            autoCorrect={false}
            value={formatFamilyCode(code)}
            onChangeText={(value) => setCode(normalizeFamilyCode(value))}
            placeholder={t('sharing.joinCodePlaceholder')}
            placeholderTextColor={textSecondaryColor}
            style={[styles.input, { color: textColor, borderColor, backgroundColor: surfaceColor }]}
          />
          <View style={styles.actions}>
            <Button
              title={t('sharing.previewJoin')}
              onPress={() => void handlePreview()}
              disabled={isPreviewLoading || code.length < 4}
            />
          </View>
        </GroupedSection>

        {error ? <ThemedText style={styles.error}>{translateError(t, error)}</ThemedText> : null}

        {preview ? (
          <GroupedSection title={t('sharing.joinPreviewSection')}>
            <View style={styles.previewBlock}>
              <ThemedText type="defaultSemiBold">
                {t('sharing.joinPreviewOwner', {
                  name: preview.ownerDisplayName ?? t('sharing.someone'),
                })}
              </ThemedText>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.previewPets}>
                {preview.pets.map((pet) => pet.name).join(', ')}
              </ThemedText>
              <Button
                title={t('sharing.acceptJoin')}
                onPress={() => void handleJoin()}
                disabled={isJoining}
              />
            </View>
          </GroupedSection>
        ) : null}

        {familyGroupIds.length > 0 ? (
          <GroupedSection title={t('sharing.yourMembershipsSection')}>
            {familyGroupIds.map((familyGroupId, index) => (
              <View key={familyGroupId} style={styles.membershipRow}>
                <ThemedText>{t('sharing.activeMembership')}</ThemedText>
                <Button
                  title={t('sharing.leaveFamily')}
                  variant="secondary"
                  onPress={() => handleLeave(familyGroupId)}
                  disabled={isLoading}
                />
                {index < familyGroupIds.length - 1 ? <View style={styles.spacer} /> : null}
              </View>
            ))}
          </GroupedSection>
        ) : null}

        {showOwnerFallback ? (
          <Pressable accessibilityRole="button" onPress={handleSwitchToOwner} style={styles.ownerFallback}>
            <ThemedText lightColor={brandAccentColor} darkColor={brandAccentColor}>
              {t('sharing.addOwnPetInstead')}
            </ThemedText>
          </Pressable>
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
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  intro: {
    ...Typography.body,
  },
  input: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    letterSpacing: 2,
  },
  actions: {
    padding: Spacing.md,
  },
  error: {
    color: '#FF6B6B',
    ...Typography.caption,
  },
  previewBlock: {
    gap: Spacing.md,
    padding: Spacing.md,
  },
  previewPets: {
    ...Typography.body,
  },
  membershipRow: {
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  spacer: {
    height: Spacing.sm,
  },
  ownerFallback: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
