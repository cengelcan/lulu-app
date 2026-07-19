export function shouldStackFormHeader(width: number, fontScale: number): boolean {
  return width < 360 || fontScale >= 1.4;
}

export function shouldCompactOnboardingVisual(height: number, fontScale: number): boolean {
  return height < 700 || fontScale >= 1.3;
}
