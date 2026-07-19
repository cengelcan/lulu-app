import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { getLocaleTag } from '@/utils/locale';
import { getReminderFormRoute, getReminderTitle } from '@/utils/pet-reminder-display';
import { formatReminderTime24h } from '@/utils/time';
import type { NextCareAction } from '@/utils/dashboard/build-next-care-action';

type TodayCareSectionProps = {
  action: NextCareAction;
  petName: string;
};

type ActionPresentation = {
  title: string;
  message: string;
  buttonLabel: string | null;
  icon: IconSymbolName;
  tone: 'attention' | 'brand' | 'success';
};

export function TodayCareSection({ action, petName }: TodayCareSectionProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const warningColor = useThemeColor({}, 'warning');
  const successColor = useThemeColor({}, 'success');
  const semanticAccentColor = useThemeColor({}, 'accent');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const locale = getLocaleTag(language);

  const presentation: ActionPresentation = (() => {
    switch (action.kind) {
      case 'overdue_medication':
        return {
          title: t('dashboard.today.overdueMedicationTitle'),
          message: t('dashboard.today.overdueMedicationMessage', {
            name: getReminderTitle(action.reminder, t),
            count: action.overdueCount,
          }),
          buttonLabel: t('dashboard.today.reviewMedication'),
          icon: 'pills.fill',
          tone: 'attention',
        };
      case 'overdue_reminder':
        return {
          title: t('dashboard.today.overdueReminderTitle'),
          message: t('dashboard.today.overdueReminderMessage', {
            name: getReminderTitle(action.reminder, t),
            count: action.overdueCount,
          }),
          buttonLabel: t('dashboard.today.reviewReminder'),
          icon: 'exclamationmark.triangle',
          tone: 'attention',
        };
      case 'check_in':
        return {
          title: t('dashboard.today.checkInTitle', { name: petName }),
          message: t('dashboard.today.checkInMessage'),
          buttonLabel: t('dashboard.startCheckIn'),
          icon: 'calendar.badge.checkmark',
          tone: 'brand',
        };
      case 'upcoming_reminder':
        return {
          title: t('dashboard.today.upcomingTitle'),
          message: t('dashboard.today.upcomingMessage', {
            name: getReminderTitle(action.reminder, t),
            date: new Date(`${action.reminder.dueDate}T12:00:00`).toLocaleDateString(locale, {
              day: 'numeric',
              month: 'short',
            }),
            time: formatReminderTime24h(action.reminder.dueTime),
          }),
          buttonLabel: t('dashboard.today.viewReminder'),
          icon: 'clock.fill',
          tone: 'brand',
        };
      case 'all_complete':
        return {
          title: t('dashboard.today.completeTitle'),
          message: t('dashboard.today.completeMessage', { name: petName }),
          buttonLabel: null,
          icon: 'checkmark.circle.fill',
          tone: 'success',
        };
    }
  })();

  const actionAccentColor =
    presentation.tone === 'attention'
      ? warningColor
      : presentation.tone === 'success'
        ? successColor
        : semanticAccentColor;

  const handlePress = () => {
    switch (action.kind) {
      case 'overdue_medication':
      case 'overdue_reminder':
      case 'upcoming_reminder':
        router.push(getReminderFormRoute(action.reminder.type, action.reminder.id) as Href);
        break;
      case 'check_in':
        router.push('/check-in' as Href);
        break;
      case 'all_complete':
        break;
    }
  };
  return (
    <View style={styles.section}>
      <ThemedText accessibilityRole="header" type="subtitle" style={styles.sectionTitle}>
        {t('dashboard.today.title')}
      </ThemedText>
      <Card style={[styles.card, { borderColor: `${actionAccentColor}55` }]}>
        <View
          accessibilityLabel={`${presentation.title}. ${presentation.message}`}
          accessible
          style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${actionAccentColor}1F` }]}>
            <IconSymbol name={presentation.icon} size={22} color={actionAccentColor} />
          </View>
          <View style={styles.copy}>
            <ThemedText type="defaultSemiBold" style={styles.title}>
              {presentation.title}
            </ThemedText>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.message}>
              {presentation.message}
            </ThemedText>
          </View>
        </View>
        {presentation.buttonLabel ? (
          <Button
            title={presentation.buttonLabel}
            onPress={handlePress}
            accessibilityLabel={presentation.buttonLabel}
          />
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleSmall,
  },
  card: {
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: Spacing.xxs,
  },
  title: {
    ...Typography.bodySemiBold,
  },
  message: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
