import { StyleSheet, View } from 'react-native';

import { REMINDER_TYPES } from '@/constants/reminder-types';
import type { ReminderTypeGridLabelKey } from '@/constants/reminder-types';
import { Spacing } from '@/constants/theme';
import type { ReminderTypeId } from '@/types/pet-reminder';

import { ReminderTypeGridItem } from './ReminderTypeGridItem';

type ReminderTypeGridProps = {
  onPressType: (type: ReminderTypeId) => void;
  getGridLabel: (key: ReminderTypeGridLabelKey) => string;
  getGridSubtitle?: (key: 'reminders.grid.customSubtitle') => string;
};

export function ReminderTypeGrid({
  onPressType,
  getGridLabel,
  getGridSubtitle,
}: ReminderTypeGridProps) {
  return (
    <View style={styles.grid}>
      {REMINDER_TYPES.map((reminderType) => (
        <ReminderTypeGridItem
          key={reminderType.id}
          label={getGridLabel(reminderType.gridLabelKey)}
          subtitle={
            reminderType.gridSubtitleKey && getGridSubtitle
              ? getGridSubtitle(reminderType.gridSubtitleKey)
              : undefined
          }
          icon={reminderType.icon}
          backgroundColor={reminderType.backgroundColor}
          onPress={() => onPressType(reminderType.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
});
