import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { RegionalFormatContext } from '@/utils/regional-format';
import {
  formatDateTime,
  formatLongDate,
  formatMediumDate,
  formatRegionalNumber,
  formatShortDate,
  formatTime,
  formatWallClockTime,
  formatWeekdayDate,
  formatWeight,
} from '@/utils/formatters';

const turkeyEnglishContext: RegionalFormatContext = {
  language: 'en',
  languageLocale: 'en-US',
  regionCode: 'TR',
  datePartOrder: 'dmy',
  dateSeparator: '.',
  decimalSeparator: ',',
  digitGroupingSeparator: '.',
  measurementSystem: 'metric',
  uses24HourClock: true,
  timeZone: 'Europe/Istanbul',
};

describe('regional date and time formatters', () => {
  const date = new Date('2026-07-27T11:30:00.000Z');

  it('shows English text with Turkish date order and clock preference', () => {
    assert.equal(formatShortDate(date, turkeyEnglishContext), '27.07.2026');
    assert.equal(formatLongDate(date, turkeyEnglishContext), '27 July 2026');
    assert.equal(formatMediumDate(date, turkeyEnglishContext), '27 Jul 2026');
    assert.equal(formatWeekdayDate(date, turkeyEnglishContext), 'Monday, 27 Jul');
    assert.equal(formatTime(date, turkeyEnglishContext), '14:30');
    assert.equal(formatWallClockTime({ hour: 9, minute: 5 }, turkeyEnglishContext), '09:05');
    assert.equal(formatDateTime(date, turkeyEnglishContext), '27 Jul 2026 · 14:30');
  });

  it('uses US month-first ordering when the device region requests it', () => {
    const usContext: RegionalFormatContext = {
      ...turkeyEnglishContext,
      regionCode: 'US',
      datePartOrder: 'mdy',
      dateSeparator: '/',
      decimalSeparator: '.',
      digitGroupingSeparator: ',',
      uses24HourClock: false,
      timeZone: 'UTC',
    };

    assert.equal(formatShortDate(date, usContext), '07/27/2026');
    assert.equal(formatLongDate(date, usContext), 'July 27, 2026');
    assert.match(formatTime(date, usContext), /11:30\s?AM/i);
    assert.match(formatWallClockTime({ hour: 9, minute: 5 }, usContext), /09:05\s?AM/i);
  });

  it('keeps Turkish copy while honoring a US month-first region', () => {
    const turkishUsContext: RegionalFormatContext = {
      ...turkeyEnglishContext,
      language: 'tr',
      languageLocale: 'tr-TR',
      regionCode: 'US',
      datePartOrder: 'mdy',
      dateSeparator: '/',
      timeZone: 'UTC',
    };

    assert.equal(formatLongDate(date, turkishUsContext), 'Temmuz 27, 2026');
    assert.equal(formatWeekdayDate(date, turkishUsContext), 'Pazartesi, Tem 27');
  });

  it('does not shift date-only values across time zones', () => {
    const pacificContext: RegionalFormatContext = {
      ...turkeyEnglishContext,
      timeZone: 'America/Los_Angeles',
    };

    assert.equal(formatShortDate('2026-01-01', pacificContext), '01.01.2026');
    assert.equal(formatLongDate('2026-01-01', pacificContext), '1 January 2026');
  });
});

describe('regional number and weight formatters', () => {
  it('does not require Intl formatToParts support', () => {
    const originalDateFormatToParts = Intl.DateTimeFormat.prototype.formatToParts;
    const originalNumberFormatToParts = Intl.NumberFormat.prototype.formatToParts;

    Object.defineProperty(Intl.DateTimeFormat.prototype, 'formatToParts', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(Intl.NumberFormat.prototype, 'formatToParts', {
      configurable: true,
      value: undefined,
    });

    try {
      assert.equal(formatShortDate('2026-07-27', turkeyEnglishContext), '27.07.2026');
      assert.equal(formatLongDate('2026-07-27', turkeyEnglishContext), '27 July 2026');
      assert.equal(
        formatRegionalNumber(1234.5, turkeyEnglishContext, { maximumFractionDigits: 1 }),
        '1.234,5'
      );
    } finally {
      Object.defineProperty(Intl.DateTimeFormat.prototype, 'formatToParts', {
        configurable: true,
        writable: true,
        value: originalDateFormatToParts,
      });
      Object.defineProperty(Intl.NumberFormat.prototype, 'formatToParts', {
        configurable: true,
        writable: true,
        value: originalNumberFormatToParts,
      });
    }
  });

  it('uses device separators independently from the app language', () => {
    assert.equal(
      formatRegionalNumber(1234.5, turkeyEnglishContext, { maximumFractionDigits: 1 }),
      '1.234,5'
    );
  });

  it('converts a legacy kg record for display without mutating the source', () => {
    const sourceKg = 4.75;
    assert.equal(formatWeight(sourceKg, 'kg', 'lb', turkeyEnglishContext), '10,5 lb');
    assert.equal(sourceKg, 4.75);
  });
});
