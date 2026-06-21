import type { ReportCheckInEntry, ReportRecordDayGroup } from '@/types/report';

/**
 * expo-print renders the PDF page at 72 PPI (points), while the WebView lays out
 * CSS at 96 PPI (reference pixels). 1 PDF point therefore equals 96/72 CSS px.
 * Keeping this single conversion factor is what stops the two coordinate systems
 * from drifting apart and leaving empty bands on every page.
 */
export const PX_PER_PT = 96 / 72;

/**
 * Physical PDF page size in points (72 PPI) — US Letter. These are the exact
 * values handed to `Print.printToFileAsync({ width, height })`.
 */
export const REPORT_PDF_PAGE_WIDTH_PT = 612;
export const REPORT_PDF_PAGE_HEIGHT_PT = 792;

/**
 * CSS layout page size in px (96 PPI). Derived from the PDF point size so the
 * fixed-height `.report-page` box exactly fills the physical sheet instead of
 * covering only ~75% of it.
 */
export const REPORT_PAGE_WIDTH = Math.round(REPORT_PDF_PAGE_WIDTH_PT * PX_PER_PT);
export const REPORT_PAGE_HEIGHT = Math.round(REPORT_PDF_PAGE_HEIGHT_PT * PX_PER_PT);

export const REPORT_HEADER_HEIGHT = 56;
export const REPORT_FOOTER_HEIGHT = 28;
export const REPORT_BODY_PADDING_Y = 8;
export const REPORT_BODY_PADDING_X = 16;

/**
 * White margin between the physical sheet edge and the rounded content card.
 * The header, body and footer all live inside this inset, rounded card.
 */
export const REPORT_PAGE_MARGIN = 20;
export const REPORT_SHEET_RADIUS = 16;

/** The rounded card that wraps header + body + footer, inset by the margin. */
export const REPORT_SHEET_WIDTH = REPORT_PAGE_WIDTH - REPORT_PAGE_MARGIN * 2;
export const REPORT_SHEET_HEIGHT = REPORT_PAGE_HEIGHT - REPORT_PAGE_MARGIN * 2;

export const REPORT_CONTENT_WIDTH = REPORT_SHEET_WIDTH - REPORT_BODY_PADDING_X * 2;

/** Usable body height: sheet - header - footer - vertical padding. */
export const REPORT_CONTENT_HEIGHT =
  REPORT_SHEET_HEIGHT -
  REPORT_HEADER_HEIGHT -
  REPORT_FOOTER_HEIGHT -
  REPORT_BODY_PADDING_Y * 2;

export const OBSERVATION_CHIP_GAP = 6;

export const OBSERVATION_CHIP_MIN_WIDTH = Math.floor(
  (REPORT_CONTENT_WIDTH - OBSERVATION_CHIP_GAP * 7) / 8
);

export const MAX_OBSERVATION_CHIPS_PER_ROW = Math.max(
  1,
  Math.floor(
    (REPORT_CONTENT_WIDTH + OBSERVATION_CHIP_GAP) /
      (OBSERVATION_CHIP_MIN_WIDTH + OBSERVATION_CHIP_GAP)
  )
);

/**
 * Conservative per-block height estimates (CSS px @96 PPI). These intentionally
 * round *up* from the real rendered heights: the page body uses `overflow:
 * hidden`, so under-counting silently clips trailing content (e.g. the records
 * section). Over-counting only costs a little extra whitespace and pushes
 * overflowing content onto the next page instead of dropping it.
 */
export const HEIGHT_ESTIMATES = {
  petCard: 124,
  summary: 42,
  sectionTitle: 18,
  sectionGap: 4,
  checkInDayTitle: 18,
  checkInChipRow: 58,
  checkInNotes: 14,
  checkInDayGap: 5,
  recordDayTitle: 18,
  recordEntry: 42,
  recordEntryWithNotes: 58,
  recordDayGap: 5,
  emptyMessage: 40,
} as const;

export function estimateCheckInDayHeight(entry: ReportCheckInEntry): number {
  const chipRows = Math.ceil(entry.fields.length / MAX_OBSERVATION_CHIPS_PER_ROW);
  const notesHeight = entry.notes ? HEIGHT_ESTIMATES.checkInNotes : 0;

  return (
    HEIGHT_ESTIMATES.checkInDayTitle +
    chipRows * HEIGHT_ESTIMATES.checkInChipRow +
    notesHeight +
    HEIGHT_ESTIMATES.checkInDayGap
  );
}

export function estimateRecordEntryHeight(hasNotes: boolean): number {
  return hasNotes ? HEIGHT_ESTIMATES.recordEntryWithNotes : HEIGHT_ESTIMATES.recordEntry;
}

export function estimateRecordGroupHeight(group: ReportRecordDayGroup): number {
  const entriesHeight = group.entries.reduce(
    (total, entry) => total + estimateRecordEntryHeight(Boolean(entry.notes)),
    0
  );

  return HEIGHT_ESTIMATES.recordDayTitle + entriesHeight + HEIGHT_ESTIMATES.recordDayGap;
}

export function estimateSectionHeadingHeight(): number {
  return HEIGHT_ESTIMATES.sectionTitle + HEIGHT_ESTIMATES.sectionGap;
}

export type ReportContentBlock =
  | { type: 'petCard' }
  | { type: 'summary' }
  | { type: 'checkInsHeading' }
  | { type: 'checkInDay'; entry: ReportCheckInEntry }
  | { type: 'recordsHeading' }
  | { type: 'recordGroup'; group: ReportRecordDayGroup };

export function buildReportContentBlocks(
  content: {
    isEmpty: boolean;
    checkIns: ReportCheckInEntry[];
    recordGroups: ReportRecordDayGroup[];
  },
  options: { hasSummary?: boolean } = {}
): ReportContentBlock[] {
  if (content.isEmpty) {
    return [{ type: 'petCard' }];
  }

  const blocks: ReportContentBlock[] = [{ type: 'petCard' }];

  if (options.hasSummary) {
    blocks.push({ type: 'summary' });
  }

  if (content.checkIns.length > 0) {
    blocks.push({ type: 'checkInsHeading' });
    for (const entry of content.checkIns) {
      blocks.push({ type: 'checkInDay', entry });
    }
  }

  if (content.recordGroups.length > 0) {
    blocks.push({ type: 'recordsHeading' });
    for (const group of content.recordGroups) {
      blocks.push({ type: 'recordGroup', group });
    }
  }

  return blocks;
}

export function estimateBlockHeight(block: ReportContentBlock): number {
  switch (block.type) {
    case 'petCard':
      return HEIGHT_ESTIMATES.petCard;
    case 'summary':
      return HEIGHT_ESTIMATES.summary;
    case 'checkInsHeading':
    case 'recordsHeading':
      return estimateSectionHeadingHeight();
    case 'checkInDay':
      return estimateCheckInDayHeight(block.entry);
    case 'recordGroup':
      return estimateRecordGroupHeight(block.group);
  }
}

export function getRemainingPageHeight(currentY: number): number {
  return REPORT_CONTENT_HEIGHT - currentY;
}

export function estimateMinimumRecordGroupHeight(group: ReportRecordDayGroup): number {
  if (group.entries.length === 0) {
    return HEIGHT_ESTIMATES.recordDayTitle + HEIGHT_ESTIMATES.recordDayGap;
  }

  return (
    HEIGHT_ESTIMATES.recordDayTitle +
    estimateRecordEntryHeight(Boolean(group.entries[0].notes)) +
    HEIGHT_ESTIMATES.recordDayGap
  );
}
