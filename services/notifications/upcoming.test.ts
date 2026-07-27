import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getUpcomingReminder } from '@/services/notifications/upcoming';
import type { RegionalFormatContext } from '@/utils/regional-format';

const regionalFormat: RegionalFormatContext = {
  language: 'en', languageLocale: 'en-US', regionCode: 'TR', datePartOrder: 'dmy',
  dateSeparator: '.', decimalSeparator: ',', digitGroupingSeparator: '.',
  measurementSystem: 'metric', uses24HourClock: true, timeZone: 'Europe/Istanbul',
};

describe('upcoming notification reminder display', () => {
  it('keeps a future wall-clock time unchanged in a 24-hour region', () => {
    const upcoming = getUpcomingReminder(
      { hour: 18, minute: 5 },
      'en',
      new Date('2026-07-27T12:00:00.000Z'),
      regionalFormat
    );

    assert.equal(upcoming?.timeLabel, '18:05');
  });

  it('moves an elapsed wall-clock reminder to tomorrow without changing its time', () => {
    const upcoming = getUpcomingReminder(
      { hour: 8, minute: 30 },
      'en',
      new Date(2026, 6, 27, 12, 0),
      regionalFormat
    );

    assert.equal(upcoming?.dateLabel, 'Tomorrow');
    assert.equal(upcoming?.timeLabel, '08:30');
  });
});
