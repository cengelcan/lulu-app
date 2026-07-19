import type { IconSymbolName } from '@/components/ui/icon-symbol';
import {
  LULU_PLUS_BENEFITS,
  type PlusBenefitTitleKey,
} from '@/constants/plus-benefits';
import { Palette } from '@/constants/theme';

type PlusFeatureVisual = {
  icon: IconSymbolName;
  iconColor: string;
};

export type PlusFeatureConfig = (typeof LULU_PLUS_BENEFITS)[number] & PlusFeatureVisual;

const PLUS_FEATURE_VISUALS: Record<PlusBenefitTitleKey, PlusFeatureVisual> = {
  'paywall.smartRemindersTitle': {
    icon: 'calendar.badge.checkmark',
    iconColor: Palette.badgeOrange,
  },
  'paywall.advancedReportsTitle': {
    icon: 'doc.text.fill',
    iconColor: Palette.brandAccent,
  },
  'paywall.familySharingTitle': {
    icon: 'person.2.fill',
    iconColor: Palette.badgePink,
  },
  'paywall.longerHistoryTitle': {
    icon: 'clock.fill',
    iconColor: Palette.brandAccentDark,
  },
  'paywall.multiplePetsTitle': {
    icon: 'pawprint.fill',
    iconColor: Palette.badgeEmerald,
  },
};

/** Shared Lulu Plus benefit list — keep profile card and paywall in sync. */
export const LULU_PLUS_FEATURES: PlusFeatureConfig[] = LULU_PLUS_BENEFITS.map((benefit) => ({
  ...benefit,
  ...PLUS_FEATURE_VISUALS[benefit.titleKey],
}));
