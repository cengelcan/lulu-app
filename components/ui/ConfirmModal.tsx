import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** iOS only: fired after the modal has finished dismissing. Use this to run
   *  navigation that must wait until the native modal is gone (avoids a frozen,
   *  unresponsive screen from a lingering modal overlay). */
  onDismiss?: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
  onDismiss,
}: ConfirmModalProps) {
  const { t } = useTranslation();
  const surfaceColor = useThemeColor({}, 'surfaceElevated');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const resolvedCancelLabel = cancelLabel ?? t('common.cancel');

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
            {title}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.message}>
            {message}
          </ThemedText>
          <View style={styles.actions}>
            <Button
              accessibilityLabel={resolvedCancelLabel}
              title={resolvedCancelLabel}
              variant="secondary"
              disabled={isLoading}
              onPress={onCancel}
              style={styles.actionButton}
            />
            <Button
              accessibilityLabel={confirmLabel}
              title={confirmLabel}
              variant={destructive ? 'destructive' : 'primary'}
              disabled={isLoading}
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
    marginBottom: Spacing.sm,
  },
  actions: {
    gap: Spacing.sm,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});
