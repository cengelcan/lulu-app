import { Palette } from '@/constants/theme-colors';

function parseHexColor(color: string): [number, number, number] | null {
  const normalized = color.trim().replace(/^#/, '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((character) => `${character}${character}`)
          .join('')
      : normalized;

  if (!/^[0-9a-f]{6}$/i.test(expanded)) {
    return null;
  }

  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ];
}

function toLinearChannel(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function getRelativeLuminance(color: string): number | null {
  const channels = parseHexColor(color);

  if (!channels) {
    return null;
  }

  const [red, green, blue] = channels.map(toLinearChannel);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function getContrastRatio(firstColor: string, secondColor: string): number | null {
  const firstLuminance = getRelativeLuminance(firstColor);
  const secondLuminance = getRelativeLuminance(secondColor);

  if (firstLuminance === null || secondLuminance === null) {
    return null;
  }

  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getReadableForegroundColor(
  backgroundColor: string,
  darkColor = Palette.ink,
  lightColor = Palette.onDark
): string {
  const darkContrast = getContrastRatio(backgroundColor, darkColor);
  const lightContrast = getContrastRatio(backgroundColor, lightColor);

  if (darkContrast === null || lightContrast === null) {
    return darkColor;
  }

  return darkContrast >= lightContrast ? darkColor : lightColor;
}
