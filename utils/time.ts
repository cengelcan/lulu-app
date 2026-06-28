import type { ReminderTime } from '@/types/reminder';

export function formatReminderTime24h({ hour, minute }: ReminderTime): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatReminderTime({ hour, minute }: ReminderTime): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** 12-hour clock display for reminder pickers (e.g. 6:00 PM instead of 18:00). */
export function formatReminderTime12h({ hour, minute }: ReminderTime, locale?: string): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Wall-clock angle in degrees for dial UI.
 * 12 o'clock is at the top (-90°), advancing clockwise.
 */
export function reminderTimeToClockAngleDegrees(time: ReminderTime): number {
  const hours12 = time.hour % 12;
  const degreesFromTwelve = hours12 * 30 + time.minute * 0.5;
  return -90 + degreesFromTwelve;
}

export function getReminderDialArcDots(
  time: ReminderTime,
  radius: number,
  center: number,
  segmentCount = 28
): { left: number; top: number }[] {
  const startAngle = -90;
  const endAngle = reminderTimeToClockAngleDegrees(time);
  const sweep = endAngle - startAngle;

  if (sweep <= 0) {
    return [{ left: center - 2, top: center - radius - 2 }];
  }

  const dots: { left: number; top: number }[] = [];
  for (let index = 0; index <= segmentCount; index += 1) {
    const progress = index / segmentCount;
    const angleRadians = ((startAngle + sweep * progress) * Math.PI) / 180;
    dots.push({
      left: center + radius * Math.cos(angleRadians) - 2.5,
      top: center + radius * Math.sin(angleRadians) - 2.5,
    });
  }

  return dots;
}

export function getReminderDialKnobPosition(
  time: ReminderTime,
  radius: number,
  center: number,
  knobSize = 20
): { left: number; top: number } {
  const angleRadians = (reminderTimeToClockAngleDegrees(time) * Math.PI) / 180;
  const offset = knobSize / 2;

  return {
    left: center + radius * Math.cos(angleRadians) - offset,
    top: center + radius * Math.sin(angleRadians) - offset,
  };
}

export function reminderTimeFromDate(date: Date): ReminderTime {
  return { hour: date.getHours(), minute: date.getMinutes() };
}

export function reminderTimeToDate({ hour, minute }: ReminderTime): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function isValidReminderTime(time: ReminderTime): boolean {
  return (
    Number.isInteger(time.hour) &&
    Number.isInteger(time.minute) &&
    time.hour >= 0 &&
    time.hour <= 23 &&
    time.minute >= 0 &&
    time.minute <= 59
  );
}
