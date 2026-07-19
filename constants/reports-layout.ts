export function shouldStackReportActions(width: number, fontScale: number): boolean {
  return width < 360 || fontScale >= 1.4;
}
