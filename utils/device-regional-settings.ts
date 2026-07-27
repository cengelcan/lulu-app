import { getCalendars, getLocales } from 'expo-localization';

import type { DeviceRegionalSnapshot } from '@/utils/regional-format';

export function getDeviceRegionalSnapshot(): DeviceRegionalSnapshot {
  const locale = getLocales()[0];
  const calendar = getCalendars()[0];

  return {
    languageTag: locale?.languageTag ?? null,
    regionCode: locale?.regionCode ?? null,
    decimalSeparator: locale?.decimalSeparator ?? null,
    digitGroupingSeparator: locale?.digitGroupingSeparator ?? null,
    measurementSystem: locale?.measurementSystem ?? null,
    uses24HourClock: calendar?.uses24hourClock ?? null,
    timeZone: calendar?.timeZone ?? null,
  };
}
