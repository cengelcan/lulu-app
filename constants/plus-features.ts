import type { IconSymbolName } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';

export type PlusFeatureConfig = {
  icon: IconSymbolName;
  titleKey:
    | 'paywall.trendsTitle'
    | 'paywall.smartRemindersTitle'
    | 'paywall.advancedReportsTitle'
    | 'paywall.familySharingTitle'
    | 'paywall.longerHistoryTitle'
    | 'paywall.multiplePetsTitle';
  descriptionKey:
    | 'paywall.trendsDescription'
    | 'paywall.smartRemindersDescription'
    | 'paywall.advancedReportsDescription'
    | 'paywall.familySharingDescription'
    | 'paywall.longerHistoryDescription'
    | 'paywall.multiplePetsDescription';
  iconColor: string;
};

/** Shared Lulu Plus benefit list — keep profile card and paywall in sync. */
export const LULU_PLUS_FEATURES: PlusFeatureConfig[] = [
  {
    icon: 'chart.line.uptrend.xyaxis',
    titleKey: 'paywall.trendsTitle',
    descriptionKey: 'paywall.trendsDescription',
    iconColor: Palette.badgeViolet,
  },
  {
    icon: 'calendar.badge.checkmark',
    titleKey: 'paywall.smartRemindersTitle',
    descriptionKey: 'paywall.smartRemindersDescription',
    iconColor: Palette.badgeOrange,
  },
  {
    icon: 'doc.text.fill',
    titleKey: 'paywall.advancedReportsTitle',
    descriptionKey: 'paywall.advancedReportsDescription',
    iconColor: Palette.brandAccent,
  },
  {
    icon: 'person.2.fill',
    titleKey: 'paywall.familySharingTitle',
    descriptionKey: 'paywall.familySharingDescription',
    iconColor: Palette.badgePink,
  },
  {
    icon: 'clock.fill',
    titleKey: 'paywall.longerHistoryTitle',
    descriptionKey: 'paywall.longerHistoryDescription',
    iconColor: Palette.brandAccentDark,
  },
  {
    icon: 'pawprint.fill',
    titleKey: 'paywall.multiplePetsTitle',
    descriptionKey: 'paywall.multiplePetsDescription',
    iconColor: Palette.badgeEmerald,
  },
];
