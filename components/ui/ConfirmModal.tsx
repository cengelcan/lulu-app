import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

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
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const surfaceColor = useThemeColor({}, 'surfaceElevated');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}>
      <Pressable
        accessibilityLabel="Dismiss dialog"
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
              accessibilityLabel={cancelLabel}
              title={cancelLabel}
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
