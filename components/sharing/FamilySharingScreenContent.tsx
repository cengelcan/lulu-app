import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { LuluPlusPaywall } from '@/components/paywall/LuluPlusPaywall';
import { GroupedSection } from '@/components/pet/GroupedSection';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing, Typography } from '@/constants/theme';
import { useFamilyPlusAccess } from '@/hooks/use-family-plus';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { usePetStore } from '@/stores/pet.store';
import { useSharingStore } from '@/stores/sharing.store';
import { buildFamilyJoinUrl, formatFamilyCode } from '@/utils/sharing/family-code';
import { copyTextToClipboard } from '@/utils/copy-to-clipboard';
import { translateError } from '@/utils/translate-error';

type FamilySharingScreenContentProps = {
  edges?: Edge[];
};

export function FamilySharingScreenContent({
  edges = ['bottom'],
}: FamilySharingScreenContentProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { canUseFamilySharing } = useFamilyPlusAccess();
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const borderColor = useThemeColor({}, 'border');

  const pets = usePetStore((state) => state.pets);
  const familyGroup = useSharingStore((state) => state.familyGroup);
  const sharedPetIds = useSharingStore((state) => state.sharedPetIds);
  const members = useSharingStore((state) => state.members);
  const isLoading = useSharingStore((state) => state.isLoading);
  const error = useSharingStore((state) => state.error);
  const loadOwnerFamilySharing = useSharingStore((state) => state.loadOwnerFamilySharing);
  const ensureFamilyGroup = useSharingStore((state) => state.ensureFamilyGroup);
  const rotateCode = useSharingStore((state) => state.rotateCode);
  const setSharedPets = useSharingStore((state) => state.setSharedPets);
  const removeMember = useSharingStore((state) => state.removeMember);
  const deactivateSharing = useSharingStore((state) => state.deactivateSharing);
  const clearError = useSharingStore((state) => state.clearError);

  const [isPaywallVisible, setIsPaywallVisible] = useState(false);
  const [isSavingPets, setIsSavingPets] = useState(false);

  const activeOwnedPets = useMemo(
    () => pets.filter((pet) => pet.status !== 'deceased' && (pet.sharingRole ?? 'owner') === 'owner'),
    [pets]
  );

  const selectedPetIds = useMemo(() => new Set(sharedPetIds), [sharedPetIds]);

  useFocusEffect(
    useCallback(() => {
      if (canUseFamilySharing) {
        void loadOwnerFamilySharing();
      }
    }, [canUseFamilySharing, loadOwnerFamilySharing])
  );

  const handleEnableSharing = async () => {
    clearError();

    try {
      const group = await ensureFamilyGroup();

      if (sharedPetIds.length === 0 && activeOwnedPets.length > 0) {
        await setSharedPets(activeOwnedPets.map((pet) => pet.id));
      }

      await loadOwnerFamilySharing();

      if (!group) {
        return;
      }
    } catch (enableError) {
      Alert.alert(
        t('sharing.errorTitle'),
        translateError(t, enableError instanceof Error ? enableError.message : 'errors.unknown') ??
          t('errors.unknown')
      );
    }
  };

  const handleTogglePet = async (petId: string, enabled: boolean) => {
    const nextPetIds = enabled
      ? [...sharedPetIds, petId]
      : sharedPetIds.filter((id) => id !== petId);

    setIsSavingPets(true);

    try {
      await setSharedPets(nextPetIds);
    } catch (toggleError) {
      Alert.alert(
        t('sharing.errorTitle'),
        translateError(t, toggleError instanceof Error ? toggleError.message : 'errors.unknown') ??
          t('errors.unknown')
      );
    } finally {
      setIsSavingPets(false);
    }
  };

  const handleCopyCode = async () => {
    if (!familyGroup) {
      return;
    }

    const result = await copyTextToClipboard(formatFamilyCode(familyGroup.code));

    if (result === 'clipboard' && process.env.EXPO_OS === 'ios') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Alert.alert(t('sharing.codeCopiedTitle'), t('sharing.codeCopiedMessage'));
  };

  const handleShareLink = async () => {
    if (!familyGroup) {
      return;
    }

    const code = formatFamilyCode(familyGroup.code);
    const url = buildFamilyJoinUrl(familyGroup.code);

    await Share.share({
      message: t('sharing.shareMessage', { code, url }),
    });
  };

  const handleRotateCode = () => {
    Alert.alert(t('sharing.rotateCodeTitle'), t('sharing.rotateCodeMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('sharing.rotateCodeConfirm'),
        style: 'destructive',
        onPress: () => {
          void rotateCode().catch((rotateError) => {
            Alert.alert(
              t('sharing.errorTitle'),
              translateError(t, rotateError instanceof Error ? rotateError.message : 'errors.unknown') ??
                t('errors.unknown')
            );
          });
        },
      },
    ]);
  };

  const handleRemoveMember = (membershipId: string, displayName: string | null) => {
    Alert.alert(
      t('sharing.removeMemberTitle'),
      t('sharing.removeMemberMessage', { name: displayName ?? t('sharing.someone') }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('sharing.removeMemberConfirm'),
          style: 'destructive',
          onPress: () => {
            void removeMember(membershipId).catch((removeError) => {
              Alert.alert(
                t('sharing.errorTitle'),
                translateError(t, removeError instanceof Error ? removeError.message : 'errors.unknown') ??
                  t('errors.unknown')
              );
            });
          },
        },
      ]
    );
  };

  const handleDeactivate = () => {
    Alert.alert(t('sharing.deactivateTitle'), t('sharing.deactivateMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('sharing.deactivateConfirm'),
        style: 'destructive',
        onPress: () => {
          void deactivateSharing()
            .then(() => router.back())
            .catch((deactivateError) => {
              Alert.alert(
                t('sharing.errorTitle'),
                translateError(
                  t,
                  deactivateError instanceof Error ? deactivateError.message : 'errors.unknown'
                ) ?? t('errors.unknown')
              );
            });
        },
      },
    ]);
  };

  if (!canUseFamilySharing) {
    return (
      <ScreenContainer scrollable edges={edges} contentStyle={styles.content}>
        <View style={styles.centered}>
          <ThemedText type="subtitle" style={styles.title}>
            {t('sharing.plusRequiredTitle')}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.message}>
            {t('sharing.plusRequiredMessage')}
          </ThemedText>
          <Button title={t('sharing.upgradeCta')} onPress={() => setIsPaywallVisible(true)} />
        </View>
        <LuluPlusPaywall visible={isPaywallVisible} onDismiss={() => setIsPaywallVisible(false)} />
      </ScreenContainer>
    );
  }

  if (isLoading && !familyGroup) {
    return (
      <ScreenContainer edges={edges} contentStyle={styles.centered}>
        <ActivityIndicator color={primaryColor} size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable edges={edges} contentStyle={styles.content}>
      <View style={styles.body}>
        {error ? (
          <ThemedText style={styles.error}>{translateError(t, error)}</ThemedText>
        ) : null}

        {!familyGroup ? (
          <View style={styles.centered}>
            <ThemedText type="subtitle" style={styles.title}>
              {t('sharing.setupTitle')}
            </ThemedText>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.message}>
              {t('sharing.setupMessage')}
            </ThemedText>
            <Button title={t('sharing.enableSharing')} onPress={() => void handleEnableSharing()} />
          </View>
        ) : (
          <>
            <GroupedSection title={t('sharing.familyCodeSection')}>
              <View style={styles.codeBlock}>
                <ThemedText type="title" style={styles.codeText}>
                  {formatFamilyCode(familyGroup.code)}
                </ThemedText>
                <ThemedText
                  lightColor={textSecondaryColor}
                  darkColor={textSecondaryColor}
                  style={styles.codeHint}>
                  {t('sharing.familyCodeHint')}
                </ThemedText>
              </View>
              <View style={styles.codeActions}>
                <Button title={t('sharing.copyCode')} onPress={() => void handleCopyCode()} />
                <Button
                  title={t('sharing.shareLink')}
                  variant="secondary"
                  onPress={() => void handleShareLink()}
                />
              </View>
              <Pressable onPress={handleRotateCode} style={styles.textAction}>
                <ThemedText lightColor={brandAccentColor} darkColor={brandAccentColor}>
                  {t('sharing.rotateCode')}
                </ThemedText>
              </Pressable>
            </GroupedSection>

            <GroupedSection title={t('sharing.sharedPetsSection')}>
              {activeOwnedPets.map((pet, index) => (
                <View
                  key={pet.id}
                  style={[
                    styles.petRow,
                    index < activeOwnedPets.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: borderColor,
                    },
                  ]}>
                  <ThemedText style={styles.petName}>{pet.name}</ThemedText>
                  <Switch
                    value={selectedPetIds.has(pet.id)}
                    disabled={isSavingPets}
                    onValueChange={(enabled) => void handleTogglePet(pet.id, enabled)}
                  />
                </View>
              ))}
            </GroupedSection>

            <GroupedSection title={t('sharing.membersSection')}>
              {members.length === 0 ? (
                <ThemedText
                  lightColor={textSecondaryColor}
                  darkColor={textSecondaryColor}
                  style={styles.emptyMembers}>
                  {t('sharing.noMembers')}
                </ThemedText>
              ) : (
                members.map((member, index) => (
                  <View
                    key={member.memberUserId}
                    style={[
                      styles.memberRow,
                      index < members.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: borderColor,
                      },
                    ]}>
                    <View style={styles.memberInfo}>
                      <ThemedText type="defaultSemiBold">
                        {member.displayName ?? t('sharing.unnamedMember')}
                      </ThemedText>
                      <ThemedText
                        lightColor={textSecondaryColor}
                        darkColor={textSecondaryColor}
                        style={styles.memberMeta}>
                        {t('sharing.memberPetCount', { count: member.petIds.length })}
                      </ThemedText>
                    </View>
                    <Pressable onPress={() => handleRemoveMember(member.membershipId, member.displayName)}>
                      <ThemedText lightColor={brandAccentColor} darkColor={brandAccentColor}>
                        {t('sharing.removeMember')}
                      </ThemedText>
                    </Pressable>
                  </View>
                ))
              )}
            </GroupedSection>

            <Button
              title={t('sharing.deactivateSharing')}
              variant="secondary"
              onPress={handleDeactivate}
            />
          </>
        )}
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
  centered: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    ...Typography.body,
  },
  error: {
    color: '#FF6B6B',
    ...Typography.caption,
  },
  codeBlock: {
    gap: Spacing.xs,
    padding: Spacing.md,
    alignItems: 'center',
  },
  codeText: {
    letterSpacing: 4,
  },
  codeHint: {
    textAlign: 'center',
    ...Typography.caption,
  },
  codeActions: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  textAction: {
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 52,
  },
  petName: {
    ...Typography.body,
  },
  emptyMembers: {
    padding: Spacing.md,
    ...Typography.body,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 56,
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberMeta: {
    ...Typography.caption,
  },
});
