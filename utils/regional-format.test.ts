import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  resolveDatePartOrder,
  resolveRegionalFormatContext,
  type DeviceRegionalSnapshot,
} from '@/utils/regional-format';

function createSnapshot(
  overrides: Partial<DeviceRegionalSnapshot> = {}
): DeviceRegionalSnapshot {
  return {
    languageTag: 'tr-TR',
    regionCode: 'TR',
    decimalSeparator: ',',
    digitGroupingSeparator: '.',
    measurementSystem: 'metric',
    uses24HourClock: true,
    timeZone: 'Europe/Istanbul',
    ...overrides,
  };
}

describe('regional format context', () => {
  it('keeps English copy with Turkish regional formatting', () => {
    const context = resolveRegionalFormatContext('en', createSnapshot());

    assert.equal(context.languageLocale, 'en-US');
    assert.equal(context.regionCode, 'TR');
    assert.equal(context.datePartOrder, 'dmy');
    assert.equal(context.dateSeparator, '.');
    assert.equal(context.uses24HourClock, true);
    assert.equal(context.decimalSeparator, ',');
    assert.equal(context.measurementSystem, 'metric');
  });

  it('keeps Turkish copy with German regional formatting', () => {
    const context = resolveRegionalFormatContext(
      'tr',
      createSnapshot({ languageTag: 'de-DE', regionCode: 'DE', timeZone: 'Europe/Berlin' })
    );

    assert.equal(context.languageLocale, 'tr-TR');
    assert.equal(context.regionCode, 'DE');
    assert.equal(context.datePartOrder, 'dmy');
  });

  it('uses month-first only for explicit month-first regions', () => {
    assert.equal(resolveDatePartOrder('US'), 'mdy');
    assert.equal(resolveDatePartOrder('TR'), 'dmy');
    assert.equal(resolveDatePartOrder('DE'), 'dmy');
    assert.equal(resolveDatePartOrder('JP'), 'ymd');
  });

  it('uses language defaults when the device region is unavailable', () => {
    assert.equal(
      resolveRegionalFormatContext('de', createSnapshot({ regionCode: null })).regionCode,
      'DE'
    );
    assert.equal(
      resolveRegionalFormatContext('en', createSnapshot({ regionCode: null })).datePartOrder,
      'mdy'
    );
  });

  it('infers separators without Intl.NumberFormat formatToParts', () => {
    const originalFormatToParts = Intl.NumberFormat.prototype.formatToParts;
    Object.defineProperty(Intl.NumberFormat.prototype, 'formatToParts', {
      configurable: true,
      value: undefined,
    });

    try {
      const context = resolveRegionalFormatContext(
        'de',
        createSnapshot({
          languageTag: 'de-DE',
          regionCode: 'DE',
          decimalSeparator: null,
          digitGroupingSeparator: null,
        })
      );

      assert.equal(context.decimalSeparator, ',');
      assert.equal(context.digitGroupingSeparator, '.');
    } finally {
      Object.defineProperty(Intl.NumberFormat.prototype, 'formatToParts', {
        configurable: true,
        writable: true,
        value: originalFormatToParts,
      });
    }
  });
});
