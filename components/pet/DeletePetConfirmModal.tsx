import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PET_NAME_MAX_LENGTH } from '@/types/pet';

type DeletePetConfirmModalProps = {
  visible: boolean;
  petName: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** iOS only: fired after the modal has finished dismissing. */
  onDismiss?: () => void;
};

export function DeletePetConfirmModal({
  visible,
  petName,
  isLoading = false,
  onConfirm,
  onCancel,
  onDismiss,
}: DeletePetConfirmModalProps) {
  const { t } = useTranslation();
  const [confirmName, setConfirmName] = useState('');

  const surfaceColor = useThemeColor({}, 'surfaceElevated');
  const inputSurfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (visible) {
      setConfirmName('');
    }
  }, [visible, petName]);

  const isNameConfirmed = confirmName.trim() === petName.trim();

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onDismiss={onDismiss}
      onRequestClose={onCancel}>
      <Pressable
        accessibilityLabel={t('common.dismissDialog')}
        accessibilityRole="button"
        style={styles.backdrop}
        onPress={onCancel}>
        <Pressable
          style={[styles.card, { backgroundColor: surfaceColor }]}
          onPress={(event) => event.stopPropagation()}>
          <ThemedText type="subtitle" style={styles.title}>
            {t('pet.deletePetTitle', { name: petName })}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.message}>
            {t('pet.deletePetMessage', { name: petName })}
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.confirmLabel}>
            {t('pet.deletePetConfirmNameLabel', { name: petName })}
          </ThemedText>
          <TextInput
            accessibilityLabel={t('pet.deletePetConfirmNameLabel', { name: petName })}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!isLoading}
            maxLength={PET_NAME_MAX_LENGTH}
            placeholder={t('pet.deletePetConfirmNamePlaceholder')}
            placeholderTextColor={textSecondaryColor}
            returnKeyType="done"
            style={[
              styles.input,
              {
                color: textColor,
                backgroundColor: inputSurfaceColor,
                borderColor,
              },
            ]}
            value={confirmName}
            onChangeText={setConfirmName}
          />
          <View style={styles.actions}>
            <Button
              accessibilityLabel={t('common.cancel')}
              title={t('common.cancel')}
              variant="secondary"
              disabled={isLoading}
              onPress={onCancel}
              style={styles.actionButton}
            />
            <Button
              accessibilityLabel={t('common.delete')}
              title={t('common.delete')}
              variant="destructive"
              disabled={isLoading || !isNameConfirmed}
              onPress={onConfirm}
              style={styles.actionButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  confirmLabel: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});
