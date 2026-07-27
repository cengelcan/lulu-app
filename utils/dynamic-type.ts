export function getScaledLineHeight(
  lineHeight: number | undefined,
  fontScale: number,
  maxFontSizeMultiplier: number
): number | undefined {
  if (lineHeight === undefined) {
    return undefined;
  }

  return lineHeight * Math.min(fontScale, maxFontSizeMultiplier);
}
