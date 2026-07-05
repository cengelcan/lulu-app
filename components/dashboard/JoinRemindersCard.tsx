import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { useJoinRemindersPrompt } from '@/hooks/use-join-reminders-prompt';
import { useNotificationStore } from '@/stores/notification.store';
import { DEFAULT_REMINDER_TIME } from '@/types/reminder';

type JoinRemindersCardProps = {
  petName: string;
};

export function JoinRemindersCard({ petName }: JoinRemindersCardProps) {
  const { t } = useTranslation();
  const { isVisible, isLoading, dismiss } = useJoinRemindersPrompt();
  const savePermission = useNotificationStore((state) => state.savePermission);
  const saveReminderTime = useNotificationStore((state) => state.saveReminderTime);

  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  const [isEnabling, setIsEnabling] = useState(false);

  if (isLoading || !isVisible) {
    return null;
  }

  const handleEnable = async () => {
    setIsEnabling(true);

    try {
      await saveReminderTime(DEFAULT_REMINDER_TIME);
      await savePermission('allowed');
      await dismiss();

      if (process.env.EXPO_OS === 'ios') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // Store surfaces errors; keep the card visible for retry.
    } finally {
      setIsEnabling(false);
    }
  };

  const handleNotNow = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    void dismiss();
  };

  return (
    <Card style={styles.card}>
      <ThemedText type="subtitle">{t('dashboard.joinReminders.title', { name: petName })}</ThemedText>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.message}>
        {t('dashboard.joinReminders.message')}
      </ThemedText>
      <View style={styles.actions}>
        <Button
          title={t('dashboard.joinReminders.enable')}
          onPress={() => void handleEnable()}
          disabled={isEnabling}
        />
        <Pressable accessibilityRole="button" onPress={handleNotNow} style={styles.notNow}>
          <ThemedText lightColor={brandAccentColor} darkColor={brandAccentColor}>
            {t('dashboard.joinReminders.notNow')}
          </ThemedText>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
  },
  message: {
    ...Typography.body,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  notNow: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
});
