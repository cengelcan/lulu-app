import type { Href } from 'expo-router';

import type { IconSymbolName } from '@/components/ui/icon-symbol';

export type QuickActionId = 'reports' | 'records' | 'reminder';

export type QuickActionDefinition = {
  id: QuickActionId;
  icon: IconSymbolName;
  labelKey: 'dashboard.reports' | 'dashboard.records' | 'dashboard.reminder';
  subtitleKey:
    | 'dashboard.reportsSubtitle'
    | 'dashboard.recordsSubtitle'
    | 'dashboard.reminderSubtitle';
  route: Href;
  iconTint?: 'primary' | 'warning';
};

export const QUICK_ACTIONS: readonly QuickActionDefinition[] = [
  {
    id: 'reports',
    icon: 'chart.line.uptrend.xyaxis',
    labelKey: 'dashboard.reports',
    subtitleKey: 'dashboard.reportsSubtitle',
    route: '/reports' as Href,
  },
  {
    id: 'records',
    icon: 'doc.text.fill',
    labelKey: 'dashboard.records',
    subtitleKey: 'dashboard.recordsSubtitle',
    route: '/records' as Href,
  },
  {
    id: 'reminder',
    icon: 'bell.fill',
    labelKey: 'dashboard.reminder',
    subtitleKey: 'dashboard.reminderSubtitle',
    route: '/records' as Href,
    iconTint: 'warning',
  },
] as const;
