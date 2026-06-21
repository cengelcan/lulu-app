import type { ReportPreviewContent, ReportSummary, ReportSummaryLine } from '@/types/report';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

type BuildReportSummaryParams = {
  content: ReportPreviewContent;
  t: TranslateFn;
};

/**
 * Builds the compact at-a-glance summary band shown under the pet card.
 * Only daily observations contribute (records have no normal/alert state).
 */
export function buildReportSummary({ content, t }: BuildReportSummaryParams): ReportSummary {
  const lines: ReportSummaryLine[] = [];

  const observedDays = content.checkIns.length;
  if (observedDays === 0) {
    return { lines };
  }

  const attentionDays = content.checkIns.filter((day) =>
    day.fields.some((field) => !field.isNormal)
  ).length;

  lines.push({
    tone: 'neutral',
    text: t('reports.review.summaryObservedDays', { count: observedDays }),
  });

  if (attentionDays > 0) {
    lines.push({
      tone: 'alert',
      text: t('reports.review.summaryAttentionDays', { count: attentionDays }),
    });
  } else {
    lines.push({
      tone: 'normal',
      text: t('reports.review.summaryAllNormal'),
    });
  }

  return { lines };
}
