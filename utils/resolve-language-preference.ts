import type { AppLanguagePreference, ResolvedLanguage } from '@/types/language';
import { resolveDeviceLanguage } from '@/utils/device-language';

export function resolveLanguagePreference(
  preference: AppLanguagePreference
): ResolvedLanguage {
  if (preference === 'system') {
    return resolveDeviceLanguage();
  }

  return preference;
}
