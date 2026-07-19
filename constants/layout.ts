export const LayoutTokens = {
  compactWidthBreakpoint: 360,
  regularWidthBreakpoint: 760,
  compactHorizontalPadding: 16,
  horizontalPadding: 24,
  readingContentMaxWidth: 720,
  dashboardContentMaxWidth: 1120,
} as const;

export function getScreenHorizontalPadding(width: number): number {
  return width < LayoutTokens.compactWidthBreakpoint
    ? LayoutTokens.compactHorizontalPadding
    : LayoutTokens.horizontalPadding;
}
