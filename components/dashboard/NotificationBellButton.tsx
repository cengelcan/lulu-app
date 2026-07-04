import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { InboxSheet } from '@/components/inbox/InboxSheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing } from '@/constants/theme';
import { useInbox } from '@/hooks/use-inbox';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

export function NotificationBellButton() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { sections, actionRequiredCount, isLoading, error, refresh, showPetName } = useInbox();

  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const backgroundColor = useThemeColor({}, 'background');

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  useEffect(() => {
    if (isOpen) {
      void refresh();
    }
  }, [isOpen, refresh]);

  const handleOpen = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const accessibilityLabel =
    actionRequiredCount > 0
      ? t('inbox.a11y.unreadCount', { count: actionRequiredCount })
      : t('inbox.a11y.open');

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={8}
        onPress={handleOpen}
        style={({ pressed }) => [styles.bellButton, { opacity: pressed ? 0.7 : 1 }]}>
        <IconSymbol name="bell.fill" size={22} color={textSecondaryColor} />
        {actionRequiredCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: brandAccentColor }]} />
        ) : null}
      </Pressable>

      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={isOpen}
        onRequestClose={handleClose}>
        <View style={[styles.sheet, { backgroundColor }]}>
          <InboxSheet
            sections={sections}
            isLoading={isLoading}
            error={error}
            showPetName={showPetName}
            onClose={handleClose}
            onRefresh={refresh}
          />
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
  },
});
