import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';

import { FamilyIconAvatar } from '@/components/family/FamilyIconAvatar';
import { GroupedSection } from '@/components/pet/GroupedSection';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { FAMILY_ICON_PRESETS, type FamilyIconKey } from '@/constants/family-icons';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { usePetStore } from '@/stores/pet.store';
import { useSharingStore } from '@/stores/sharing.store';
import { copyTextToClipboard } from '@/utils/copy-to-clipboard';
import { formatFamilyCode } from '@/utils/sharing/family-code';
import { translateError } from '@/utils/translate-error';

export function FamilySettingsContent() {
  const { t } = useTranslation();
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const borderColor = useThemeColor({}, 'border');

  const pets = usePetStore((state) => state.pets);
  const familyGroup = useSharingStore((state) => state.familyGroup);
  const sharedPetIds = useSharingStore((state) => state.sharedPetIds);
  const isLoading = useSharingStore((state) => state.isLoading);
  const loadOwnerFamilySharing = useSharingStore((state) => state.loadOwnerFamilySharing);
  const rotateCode = useSharingStore((state) => state.rotateCode);
  const setSharedPets = useSharingStore((state) => state.setSharedPets);
  const updateFamilyProfile = useSharingStore((state) => state.updateFamilyProfile);

  const [isSavingPets, setIsSavingPets] = useState(false);
  const [familyName, setFamilyName] = useState('');

  const activeOwnedPets = useMemo(
    () => pets.filter((pet) => pet.status !== 'deceased' && (pet.sharingRole ?? 'owner') === 'owner'),
    [pets]
  );

  const selectedPetIds = useMemo(() => new Set(sharedPetIds), [sharedPetIds]);

  useFocusEffect(
    useCallback(() => {
      void loadOwnerFamilySharing();
    }, [loadOwnerFamilySharing])
  );

  useFocusEffect(
    useCallback(() => {
      if (familyGroup?.name) {
        setFamilyName(familyGroup.name);
      }
    }, [familyGroup?.name])
  );

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

  const handleSelectIcon = (iconKey: FamilyIconKey) => {
    if (!familyGroup || familyGroup.iconKey === iconKey) {
      return;
    }

    void updateFamilyProfile({ iconKey }).catch((updateError) => {
      Alert.alert(
        t('sharing.errorTitle'),
        translateError(t, updateError instanceof Error ? updateError.message : 'errors.unknown') ??
          t('errors.unknown')
      );
    });
  };

  const handleSaveName = () => {
    if (!familyGroup) {
      return;
    }

    const trimmed = familyName.trim();

    if (!trimmed || trimmed === familyGroup.name) {
      return;
    }

    void updateFamilyProfile({ name: trimmed }).catch((updateError) => {
      Alert.alert(
        t('sharing.errorTitle'),
        translateError(t, updateError instanceof Error ? updateError.message : 'errors.unknown') ??
          t('errors.unknown')
      );
    });
  };

  if (isLoading && !familyGroup) {
    return (
      <ScreenContainer edges={['bottom']} contentStyle={styles.centered}>
        <ActivityIndicator color={primaryColor} size="large" />
      </ScreenContainer>
    );
  }

  if (!familyGroup) {
    return null;
  }

  return (
    <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
      <View style={styles.body}>
        <View style={styles.profileHeader}>
          <FamilyIconAvatar iconKey={familyGroup.iconKey} size={72} />
        </View>

        <GroupedSection title={t('family.create.nameLabel')}>
          <TextInput
            accessibilityLabel={t('family.create.nameLabel')}
            value={familyName}
            onChangeText={setFamilyName}
            onBlur={handleSaveName}
            placeholder={t('family.create.nameLabel')}
            placeholderTextColor={textSecondaryColor}
            style={[styles.nameInput, { color: textColor, borderColor }]}
          />
        </GroupedSection>

        <GroupedSection title={t('family.create.iconLabel')}>
          <View style={styles.iconRow}>
            {FAMILY_ICON_PRESETS.map((preset) => {
              const selected = preset.key === familyGroup.iconKey;

              return (
                <Pressable
                  key={preset.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => handleSelectIcon(preset.key)}
                  style={[
                    styles.iconOption,
                    selected && { borderColor: brandAccentColor, borderWidth: 2 },
                  ]}>
                  <FamilyIconAvatar iconKey={preset.key} size={44} />
                </Pressable>
              );
            })}
          </View>
        </GroupedSection>

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
                trackColor={{ false: borderColor, true: primaryColor }}
              />
            </View>
          ))}
        </GroupedSection>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  nameInput: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  iconOption: {
    borderRadius: 999,
    padding: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
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
});
