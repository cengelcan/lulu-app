import { StyleSheet, View } from 'react-native';

import { REMINDER_TYPES } from '@/constants/reminder-types';
import type { ReminderTypeGridLabelKey } from '@/constants/reminder-types';
import { Spacing } from '@/constants/theme';
import type { ReminderTypeId } from '@/types/pet-reminder';

import { ReminderTypeGridItem } from './ReminderTypeGridItem';

const PRIMARY_REMINDER_TYPES = REMINDER_TYPES.filter((type) => type.id !== 'custom');
const CUSTOM_REMINDER_TYPE = REMINDER_TYPES.find((type) => type.id === 'custom');

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
      <View style={styles.primaryRow}>
        {PRIMARY_REMINDER_TYPES.map((reminderType) => (
          <ReminderTypeGridItem
            key={reminderType.id}
            label={getGridLabel(reminderType.gridLabelKey)}
            icon={reminderType.icon}
            backgroundColor={reminderType.backgroundColor}
            onPress={() => onPressType(reminderType.id)}
          />
        ))}
      </View>

      {CUSTOM_REMINDER_TYPE ? (
        <ReminderTypeGridItem
          variant="banner"
          label={getGridLabel(CUSTOM_REMINDER_TYPE.gridLabelKey)}
          subtitle={
            CUSTOM_REMINDER_TYPE.gridSubtitleKey && getGridSubtitle
              ? getGridSubtitle(CUSTOM_REMINDER_TYPE.gridSubtitleKey)
              : undefined
          }
          icon={CUSTOM_REMINDER_TYPE.icon}
          backgroundColor={CUSTOM_REMINDER_TYPE.backgroundColor}
          onPress={() => onPressType(CUSTOM_REMINDER_TYPE.id)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  primaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
