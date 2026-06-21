import type { ReportCheckInEntry, ReportPreviewContent, ReportRecordDayGroup } from '@/types/report';

import {
  HEIGHT_ESTIMATES,
  REPORT_CONTENT_HEIGHT,
  buildReportContentBlocks,
  estimateBlockHeight,
  estimateMinimumRecordGroupHeight,
  estimateRecordEntryHeight,
  estimateRecordGroupHeight,
  estimateSectionHeadingHeight,
  getRemainingPageHeight,
  type ReportContentBlock,
} from './html/report-layout';

export type ReportPageSlice = {
  includePetCard: boolean;
  includeSummary: boolean;
  showCheckInsHeading: boolean;
  showRecordsHeading: boolean;
  checkIns: ReportCheckInEntry[];
  recordGroups: ReportRecordDayGroup[];
  showEmpty: boolean;
};

function createEmptyPageSlice(): ReportPageSlice {
  return {
    includePetCard: false,
    includeSummary: false,
    showCheckInsHeading: false,
    showRecordsHeading: false,
    checkIns: [],
    recordGroups: [],
    showEmpty: false,
  };
}

function splitRecordGroup(
  group: ReportRecordDayGroup,
  maxHeight: number
): { first: ReportRecordDayGroup; remainder: ReportRecordDayGroup | null } {
  const dayTitleHeight = HEIGHT_ESTIMATES.recordDayTitle;
  let usedHeight = dayTitleHeight;
  const firstEntries = [];

  for (const entry of group.entries) {
    const entryHeight = estimateRecordEntryHeight(Boolean(entry.notes));

    if (firstEntries.length > 0 && usedHeight + entryHeight > maxHeight) {
      break;
    }

    firstEntries.push(entry);
    usedHeight += entryHeight;
  }

  if (firstEntries.length === 0 && group.entries.length > 0) {
    firstEntries.push(group.entries[0]);
  }

  const remainderEntries = group.entries.slice(firstEntries.length);
  return {
    first: { date: group.date, entries: firstEntries },
    remainder: remainderEntries.length > 0 ? { date: group.date, entries: remainderEntries } : null,
  };
}

function pushPage(pages: ReportPageSlice[], page: ReportPageSlice): void {
  if (
    page.includePetCard ||
    page.includeSummary ||
    page.checkIns.length > 0 ||
    page.recordGroups.length > 0 ||
    page.showEmpty
  ) {
    pages.push(page);
  }
}

function addBlockToPage(page: ReportPageSlice, block: ReportContentBlock): void {
  switch (block.type) {
    case 'petCard':
      page.includePetCard = true;
      break;
    case 'summary':
      page.includeSummary = true;
      break;
    case 'checkInsHeading':
      page.showCheckInsHeading = true;
      break;
    case 'checkInDay':
      page.checkIns.push(block.entry);
      break;
    case 'recordsHeading':
      page.showRecordsHeading = true;
      break;
    case 'recordGroup':
      page.recordGroups.push(block.group);
      break;
  }
}

function findNextRecordGroup(blocks: ReportContentBlock[], startIndex: number): ReportRecordDayGroup | null {
  for (let index = startIndex; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.type === 'recordGroup') {
      return block.group;
    }
  }

  return null;
}

function placeRecordGroup(
  page: ReportPageSlice,
  currentY: number,
  group: ReportRecordDayGroup
): { currentY: number; remainder: ReportRecordDayGroup | null } {
  const fullHeight = estimateRecordGroupHeight(group);
  const remaining = getRemainingPageHeight(currentY);

  if (fullHeight <= remaining) {
    addBlockToPage(page, { type: 'recordGroup', group });
    return { currentY: currentY + fullHeight, remainder: null };
  }

  const minEntryHeight = HEIGHT_ESTIMATES.recordDayTitle + HEIGHT_ESTIMATES.recordEntry;
  if (remaining < minEntryHeight) {
    return { currentY, remainder: group };
  }

  const { first, remainder } = splitRecordGroup(group, remaining);
  const placedHeight = estimateRecordGroupHeight(first);
  addBlockToPage(page, { type: 'recordGroup', group: first });
  return { currentY: currentY + placedHeight, remainder };
}

function packBlocksIntoPages(blocks: ReportContentBlock[]): ReportPageSlice[] {
  const pages: ReportPageSlice[] = [];
  let page = createEmptyPageSlice();
  let currentY = 0;
  let hasShownCheckInsHeading = false;
  let hasShownRecordsHeading = false;

  const flushPage = () => {
    pushPage(pages, page);
    page = createEmptyPageSlice();
    currentY = 0;
  };

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];

    if (block.type === 'checkInsHeading') {
      if (!hasShownCheckInsHeading) {
        const headingHeight = estimateSectionHeadingHeight();
        if (headingHeight > getRemainingPageHeight(currentY) && currentY > 0) {
          flushPage();
        }
        addBlockToPage(page, block);
        hasShownCheckInsHeading = true;
        currentY += headingHeight;
      }
      continue;
    }

    if (block.type === 'recordsHeading') {
      if (!hasShownRecordsHeading) {
        const headingHeight = estimateSectionHeadingHeight();
        const nextGroup = findNextRecordGroup(blocks, index + 1);
        const minimumRecordHeight = nextGroup ? estimateMinimumRecordGroupHeight(nextGroup) : 0;
        const requiredHeight = headingHeight + minimumRecordHeight;

        if (requiredHeight > getRemainingPageHeight(currentY) && currentY > 0) {
          flushPage();
        }

        addBlockToPage(page, block);
        hasShownRecordsHeading = true;
        currentY += headingHeight;
      }
      continue;
    }

    if (block.type === 'recordGroup') {
      let group: ReportRecordDayGroup | null = block.group;

      while (group) {
        const remaining = getRemainingPageHeight(currentY);
        const groupHeight = estimateRecordGroupHeight(group);

        if (groupHeight > remaining && currentY > 0) {
          const minEntryHeight = HEIGHT_ESTIMATES.recordDayTitle + HEIGHT_ESTIMATES.recordEntry;
          if (remaining < minEntryHeight) {
            flushPage();
            continue;
          }
        }

        const result = placeRecordGroup(page, currentY, group);
        currentY = result.currentY;
        group = result.remainder;
      }

      continue;
    }

    const blockHeight = estimateBlockHeight(block);
    if (blockHeight > getRemainingPageHeight(currentY)) {
      if (currentY > 0) {
        flushPage();
      }
    }

    addBlockToPage(page, block);
    currentY += blockHeight;
  }

  pushPage(pages, page);
  return pages;
}

export function paginateReportContent(
  content: ReportPreviewContent,
  options: { hasSummary?: boolean } = {}
): ReportPageSlice[] {
  if (content.isEmpty) {
    return [
      {
        includePetCard: true,
        includeSummary: false,
        showCheckInsHeading: false,
        showRecordsHeading: false,
        checkIns: [],
        recordGroups: [],
        showEmpty: true,
      },
    ];
  }

  const blocks = buildReportContentBlocks(content, options);
  const pages = packBlocksIntoPages(blocks);

  if (pages.length === 0) {
    return [
      {
        includePetCard: true,
        includeSummary: false,
        showCheckInsHeading: false,
        showRecordsHeading: false,
        checkIns: [],
        recordGroups: [],
        showEmpty: true,
      },
    ];
  }

  return pages;
}

export function estimatePageFillRatio(page: ReportPageSlice): number {
  let used = 0;

  if (page.includePetCard) {
    used += HEIGHT_ESTIMATES.petCard;
  }
  if (page.includeSummary) {
    used += HEIGHT_ESTIMATES.summary;
  }
  if (page.showCheckInsHeading) {
    used += estimateSectionHeadingHeight();
  }
  for (const entry of page.checkIns) {
    used += estimateBlockHeight({ type: 'checkInDay', entry });
  }
  if (page.showRecordsHeading) {
    used += estimateSectionHeadingHeight();
  }
  for (const group of page.recordGroups) {
    used += estimateBlockHeight({ type: 'recordGroup', group });
  }

  return used / REPORT_CONTENT_HEIGHT;
}
