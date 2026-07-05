import type { IconSymbolName } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';

export type FamilyIconKey = 'house_paw' | 'leaf' | 'home' | 'heart' | 'star';

export type FamilyIconPreset = {
  key: FamilyIconKey;
  icon: IconSymbolName;
  backgroundColor: string;
  iconColor: string;
};

export const FAMILY_ICON_PRESETS: FamilyIconPreset[] = [
  {
    key: 'house_paw',
    icon: 'house.fill',
    backgroundColor: Palette.brandAccentSoft,
    iconColor: Palette.brandAccent,
  },
  {
    key: 'leaf',
    icon: 'leaf.fill',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    iconColor: Palette.badgeEmerald,
  },
  {
    key: 'home',
    icon: 'house.fill',
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    iconColor: Palette.badgeOrange,
  },
  {
    key: 'heart',
    icon: 'heart.fill',
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    iconColor: Palette.badgePink,
  },
  {
    key: 'star',
    icon: 'star.fill',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    iconColor: Palette.warning,
  },
];

export const DEFAULT_FAMILY_ICON_KEY: FamilyIconKey = 'house_paw';
export const DEFAULT_FAMILY_NAME = 'Lulu Family';

export function getFamilyIconPreset(iconKey: string | null | undefined): FamilyIconPreset {
  return (
    FAMILY_ICON_PRESETS.find((preset) => preset.key === iconKey) ??
    FAMILY_ICON_PRESETS[0]
  );
}
