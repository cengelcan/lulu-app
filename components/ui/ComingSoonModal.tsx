import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';

type ComingSoonModalProps = {
  visible: boolean;
  onDismiss: () => void;
};

export function ComingSoonModal({ visible, onDismiss }: ComingSoonModalProps) {
  const { t } = useTranslation();
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable
          style={[styles.card, { backgroundColor: surfaceColor }]}
          onPress={(event) => event.stopPropagation()}>
          <ThemedText type="subtitle" style={styles.title}>
            {t('modals.comingSoonTitle')}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.message}>
            {t('modals.comingSoonMessage')}
          </ThemedText>
          <Button title={t('common.ok')} onPress={onDismiss} style={styles.button} />
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
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  button: {
    alignSelf: 'stretch',
  },
});
