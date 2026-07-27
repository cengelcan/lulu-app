import { Colors } from '@/constants/theme-colors';

export type CheckInThemeTokens = {
  background: string;
  surface: string;
  accent: string;
  textMuted: string;
  headerButtonBorder: string;
  glassSurface: string;
  glassBorder: string;
  progressTrack: string;
  toneNormal: string;
  toneNormalBg: string;
  toneAbnormal: string;
  toneAbnormalBg: string;
  toneNeutral: string;
  toneNeutralBg: string;
  toneBrand: string;
  toneBrandBg: string;
  toneAmber: string;
  toneAmberBg: string;
  toneOrange: string;
  toneOrangeBg: string;
  toneMint: string;
  toneMintBg: string;
};

export const CheckInThemes: Record<'light' | 'dark', CheckInThemeTokens> = {
  light: {
    background: Colors.light.background,
    surface: Colors.light.surface,
    accent: Colors.light.accent,
    textMuted: Colors.light.textSecondary,
    headerButtonBorder: Colors.light.border,
    glassSurface: Colors.light.surfaceElevated,
    glassBorder: Colors.light.border,
    progressTrack: Colors.light.border,
    toneNormal: '#047857',
    toneNormalBg: 'rgba(16, 185, 129, 0.14)',
    toneAbnormal: '#B91C1C',
    toneAbnormalBg: 'rgba(239, 68, 68, 0.13)',
    toneNeutral: '#52525B',
    toneNeutralBg: 'rgba(82, 82, 91, 0.10)',
    toneBrand: '#6D28D9',
    toneBrandBg: 'rgba(109, 40, 217, 0.12)',
    toneAmber: '#92400E',
    toneAmberBg: 'rgba(245, 158, 11, 0.15)',
    toneOrange: '#9A3412',
    toneOrangeBg: 'rgba(249, 115, 22, 0.14)',
    toneMint: '#047857',
    toneMintBg: 'rgba(16, 185, 129, 0.14)',
  },
  dark: {
    background: '#0D0D12',
    surface: '#1A1A24',
    accent: '#9B8AFB',
    textMuted: '#9B8AB0',
    headerButtonBorder: 'rgba(255,255,255,0.14)',
    glassSurface: 'rgba(255,255,255,0.06)',
    glassBorder: 'rgba(255,255,255,0.12)',
    progressTrack: 'rgba(255,255,255,0.08)',
    toneNormal: '#6EE7A0',
    toneNormalBg: 'rgba(110, 231, 160, 0.22)',
    toneAbnormal: '#F87171',
    toneAbnormalBg: 'rgba(248, 113, 113, 0.22)',
    toneNeutral: '#A1A1AA',
    toneNeutralBg: 'rgba(255,255,255,0.10)',
    toneBrand: '#C4B5FD',
    toneBrandBg: 'rgba(169, 152, 214, 0.28)',
    toneAmber: '#FCD34D',
    toneAmberBg: 'rgba(252, 211, 77, 0.20)',
    toneOrange: '#FDBA74',
    toneOrangeBg: 'rgba(253, 186, 116, 0.24)',
    toneMint: '#6EE7B8',
    toneMintBg: 'rgba(110, 231, 184, 0.24)',
  },
};

export type CheckInOptionTone =
  | 'normal'
  | 'abnormal'
  | 'neutral'
  | 'brand'
  | 'amber'
  | 'orange'
  | 'mint';

export function getCheckInToneColors(
  tone: CheckInOptionTone,
  theme: CheckInThemeTokens
) {
  switch (tone) {
    case 'normal':
      return { foreground: theme.toneNormal, background: theme.toneNormalBg };
    case 'abnormal':
      return { foreground: theme.toneAbnormal, background: theme.toneAbnormalBg };
    case 'neutral':
      return { foreground: theme.toneNeutral, background: theme.toneNeutralBg };
    case 'brand':
      return { foreground: theme.toneBrand, background: theme.toneBrandBg };
    case 'amber':
      return { foreground: theme.toneAmber, background: theme.toneAmberBg };
    case 'orange':
      return { foreground: theme.toneOrange, background: theme.toneOrangeBg };
    case 'mint':
      return { foreground: theme.toneMint, background: theme.toneMintBg };
  }
}
