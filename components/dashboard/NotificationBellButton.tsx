import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

type NotificationBellButtonProps = {
  hasUnread?: boolean;
};

export function NotificationBellButton({ hasUnread = false }: NotificationBellButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const backgroundColor = useThemeColor({}, 'background');

  const handleOpen = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('dashboard.notificationsA11y')}
        hitSlop={8}
        onPress={handleOpen}
        style={({ pressed }) => [styles.bellButton, { opacity: pressed ? 0.7 : 1 }]}>
        <IconSymbol name="bell.fill" size={22} color={textSecondaryColor} />
        {hasUnread ? (
          <View style={[styles.badge, { backgroundColor: brandAccentColor }]} />
        ) : null}
      </Pressable>

      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={isOpen}
        onRequestClose={handleClose}>
        <View style={[styles.sheet, { backgroundColor }]}>
          <View style={[styles.sheetHeader, { borderBottomColor: borderColor }]}>
            <ThemedText type="defaultSemiBold" style={styles.sheetTitle}>
              {t('dashboard.notificationsTitle')}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
              hitSlop={8}
              onPress={handleClose}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              <IconSymbol name="xmark.circle" size={24} color={textSecondaryColor} />
            </Pressable>
          </View>
          <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.emptyText}>
              {t('dashboard.notificationsEmpty')}
            </ThemedText>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  sheet: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: {
    ...Typography.titleSmall,
  },
  emptyState: {
    margin: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
});
