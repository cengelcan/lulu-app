import type { ReportCheckInEntry, ReportRecordDayGroup } from '@/types/report';

/** US Letter width in points; height matches A4 ratio for expo-print. */
export const REPORT_PAGE_WIDTH = 612;
export const REPORT_PAGE_HEIGHT = 792;

export const REPORT_HEADER_HEIGHT = 56;
export const REPORT_FOOTER_HEIGHT = 28;
export const REPORT_BODY_PADDING_Y = 8;
export const REPORT_BODY_PADDING_X = 16;

export const REPORT_CONTENT_WIDTH = REPORT_PAGE_WIDTH - REPORT_BODY_PADDING_X * 2;

/** Usable body height: page - header - footer - vertical padding. */
export const REPORT_CONTENT_HEIGHT =
  REPORT_PAGE_HEIGHT -
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

export const HEIGHT_ESTIMATES = {
  petCard: 90,
  summary: 34,
  sectionTitle: 17,
  sectionGap: 3,
  checkInDayTitle: 14,
  checkInChipRow: 42,
  checkInNotes: 11,
  checkInDayGap: 3,
  recordDayTitle: 15,
  recordEntry: 30,
  recordEntryWithNotes: 42,
  recordDayGap: 4,
  emptyMessage: 32,
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
