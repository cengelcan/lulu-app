import { CheckInThemes } from '@/constants/check-in-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useCheckInTheme() {
  return CheckInThemes[useColorScheme()];
}
