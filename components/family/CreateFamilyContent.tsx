import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { FamilyIconAvatar } from '@/components/family/FamilyIconAvatar';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import {
  DEFAULT_FAMILY_ICON_KEY,
  DEFAULT_FAMILY_NAME,
  FAMILY_ICON_PRESETS,
  type FamilyIconKey,
} from '@/constants/family-icons';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { usePetStore } from '@/stores/pet.store';
import { useSharingStore } from '@/stores/sharing.store';
import { translateError } from '@/utils/translate-error';

export function CreateFamilyContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const ensureFamilyGroup = useSharingStore((state) => state.ensureFamilyGroup);
  const setSharedPets = useSharingStore((state) => state.setSharedPets);
  const loadFamilyTab = useSharingStore((state) => state.loadFamilyTab);
  const pets = usePetStore((state) => state.pets);

  const [name, setName] = useState(DEFAULT_FAMILY_NAME);
  const [iconKey, setIconKey] = useState<FamilyIconKey>(DEFAULT_FAMILY_ICON_KEY);
  const [isCreating, setIsCreating] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  const activeOwnedPets = pets.filter(
    (pet) => pet.status !== 'deceased' && (pet.sharingRole ?? 'owner') === 'owner'
  );

  const handleCreate = useCallback(async () => {
    setIsCreating(true);

    try {
      await ensureFamilyGroup({ name: name.trim() || DEFAULT_FAMILY_NAME, iconKey });

      if (activeOwnedPets.length > 0) {
        await setSharedPets(activeOwnedPets.map((pet) => pet.id));
      }

      await loadFamilyTab();
      router.replace('/(tabs)/family' as Href);
    } catch (createError) {
      Alert.alert(
        t('sharing.errorTitle'),
        translateError(t, createError instanceof Error ? createError.message : 'errors.unknown') ??
          t('errors.unknown')
      );
    } finally {
      setIsCreating(false);
    }
  }, [
    activeOwnedPets,
    ensureFamilyGroup,
    iconKey,
    loadFamilyTab,
    name,
    router,
    setSharedPets,
    t,
  ]);

  return (
    <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
      <View style={styles.body}>
        <View style={styles.previewWrap}>
          <FamilyIconAvatar iconKey={iconKey} size={120} />
        </View>

        <ThemedText type="defaultSemiBold" style={styles.label}>
          {t('family.create.nameLabel')}
        </ThemedText>
        <View style={[styles.inputWrap, { borderColor, backgroundColor: surfaceColor }]}>
          <TextInput
            accessibilityLabel={t('family.create.nameLabel')}
            value={name}
            onChangeText={setName}
            placeholder={DEFAULT_FAMILY_NAME}
            placeholderTextColor={textSecondaryColor}
            style={[styles.input, { color: textColor }]}
          />
          {name.length > 0 ? (
            <Pressable accessibilityRole="button" onPress={() => setName('')} hitSlop={8}>
              <IconSymbol name="xmark.circle" size={20} color={textSecondaryColor} />
            </Pressable>
          ) : null}
        </View>

        <ThemedText type="defaultSemiBold" style={styles.label}>
          {t('family.create.iconLabel')}
        </ThemedText>
        <View style={styles.iconRow}>
          {FAMILY_ICON_PRESETS.map((preset) => {
            const selected = preset.key === iconKey;

            return (
              <Pressable
                key={preset.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setIconKey(preset.key)}
                style={[
                  styles.iconOption,
                  selected && { borderColor: brandAccentColor, borderWidth: 2 },
                ]}>
                <FamilyIconAvatar iconKey={preset.key} size={48} />
              </Pressable>
            );
          })}
        </View>

        <Button
          title={t('family.create.submit')}
          onPress={() => void handleCreate()}
          disabled={isCreating}
          trailingIcon={isCreating ? <ActivityIndicator color="#ffffff" size="small" /> : undefined}
        />
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
  previewWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  label: {
    ...Typography.caption,
    textTransform: 'none',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    ...Typography.body,
    paddingVertical: Spacing.sm,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconOption: {
    borderRadius: Radius.full,
    padding: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
});
