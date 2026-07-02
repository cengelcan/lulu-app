/** Check-In screen design tokens (reference mock). */
export const CheckInTheme = {
  background: '#0D0D12',
  surface: '#1A1A24',
  accent: '#9B8AFB',
  textMuted: '#9B8AB0',
  headerButtonBorder: 'rgba(255,255,255,0.14)',
  glassSurface: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.12)',
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
} as const;

export type CheckInOptionTone =
  | 'normal'
  | 'abnormal'
  | 'neutral'
  | 'brand'
  | 'amber'
  | 'orange'
  | 'mint';

export function getCheckInToneColors(tone: CheckInOptionTone) {
  switch (tone) {
    case 'normal':
      return { foreground: CheckInTheme.toneNormal, background: CheckInTheme.toneNormalBg };
    case 'abnormal':
      return { foreground: CheckInTheme.toneAbnormal, background: CheckInTheme.toneAbnormalBg };
    case 'neutral':
      return { foreground: CheckInTheme.toneNeutral, background: CheckInTheme.toneNeutralBg };
    case 'brand':
      return { foreground: CheckInTheme.toneBrand, background: CheckInTheme.toneBrandBg };
    case 'amber':
      return { foreground: CheckInTheme.toneAmber, background: CheckInTheme.toneAmberBg };
    case 'orange':
      return { foreground: CheckInTheme.toneOrange, background: CheckInTheme.toneOrangeBg };
    case 'mint':
      return { foreground: CheckInTheme.toneMint, background: CheckInTheme.toneMintBg };
  }
}
