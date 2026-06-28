import type { ReminderTime } from '@/types/reminder';

export type CheckInReminderPresetId = 'morning' | 'afternoon' | 'evening';

export type CheckInReminderPreset = {
  id: CheckInReminderPresetId;
  time: ReminderTime;
};

export const CHECK_IN_REMINDER_PRESETS: CheckInReminderPreset[] = [
  { id: 'morning', time: { hour: 9, minute: 0 } },
  { id: 'afternoon', time: { hour: 18, minute: 0 } },
  { id: 'evening', time: { hour: 21, minute: 0 } },
];

export function reminderTimesEqual(a: ReminderTime, b: ReminderTime): boolean {
  return a.hour === b.hour && a.minute === b.minute;
}

export function findMatchingReminderPreset(
  time: ReminderTime
): CheckInReminderPresetId | null {
  return CHECK_IN_REMINDER_PRESETS.find((preset) => reminderTimesEqual(preset.time, time))?.id ?? null;
}
