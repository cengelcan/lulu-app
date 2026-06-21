import type { Href } from 'expo-router';

import type { IconSymbolName } from '@/components/ui/icon-symbol';

export type QuickActionId = 'reports' | 'records';

export type QuickActionDefinition = {
  id: QuickActionId;
  icon: IconSymbolName;
  labelKey: 'dashboard.reports' | 'dashboard.records';
  route: Href;
};

export const QUICK_ACTIONS: readonly QuickActionDefinition[] = [
  {
    id: 'reports',
    icon: 'chart.line.uptrend.xyaxis',
    labelKey: 'dashboard.reports',
    route: '/reports' as Href,
  },
  {
    id: 'records',
    icon: 'doc.text.fill',
    labelKey: 'dashboard.records',
    route: '/records' as Href,
  },
] as const;
