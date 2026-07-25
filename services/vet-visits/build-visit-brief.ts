import type { Href } from 'expo-router';

import { CHECK_IN_CATEGORIES, CHECK_IN_NORMAL_VALUES } from '@/constants/check-in';
import type { CheckIn } from '@/types/check-in';
import type { MedicationPlan } from '@/types/medication';
import type { PetRecord } from '@/types/pet-record';
import type { ReportDateRange } from '@/types/report';
import type {
  VisitBrief,
  VisitBriefItem,
  VisitBriefSelection,
  VisitBriefSource,
} from '@/types/vet-visit';
import { getRecordFormRoute, getRecordTypeLabelKey } from '@/utils/pet-record-display';
import { isDateWithinRange, resolveReportDateRange } from '@/utils/report-range';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

type BuildVisitBriefParams = {
  range: ReportDateRange;
  selection: VisitBriefSelection;
  checkIns: CheckIn[];
  records: PetRecord[];
  medicationPlans: MedicationPlan[];
  reason?: string;
  questions?: string[];
  t: TranslateFn;
};

function normalizeQuestions(questions: string[]): string[] {
  return questions.map((question) => question.trim()).filter(Boolean);
}

function isMedicationActiveWithinRange(
  plan: MedicationPlan,
  startDate: string,
  endDate: string
): boolean {
  return (
    plan.status === 'active' &&
    plan.startsOn <= endDate &&
    (!plan.endsOn || plan.endsOn >= startDate)
  );
}

export function buildVisitBrief({
  range,
  selection,
  checkIns,
  records,
  medicationPlans,
  reason = '',
  questions = [],
  t,
}: BuildVisitBriefParams): VisitBrief {
  const { startDate, endDate } = resolveReportDateRange(range);
  const items: VisitBriefItem[] = [];
  const sources: VisitBriefSource[] = [];

  if (selection.checkIns) {
    const selectedCheckIns = checkIns
      .filter((checkIn) => isDateWithinRange(checkIn.date, startDate, endDate))
      .sort((a, b) => b.date.localeCompare(a.date));

    for (const checkIn of selectedCheckIns) {
      sources.push({
        id: `check-in:${checkIn.id}`,
        kind: 'checkIn',
        date: checkIn.date,
        label: t('vetVisit.sources.checkIn'),
        route: `/check-in?date=${encodeURIComponent(checkIn.date)}` as Href,
      });
    }

    if (selectedCheckIns.length > 0) {
      items.push({
        id: 'observed-days',
        tone: 'neutral',
        text: t('vetVisit.brief.observedDays', { count: selectedCheckIns.length }),
        sourceIds: selectedCheckIns.map((checkIn) => `check-in:${checkIn.id}`),
      });

      const attentionCheckIns = selectedCheckIns.filter((checkIn) =>
        CHECK_IN_CATEGORIES.some(
          ({ key }) => checkIn[key] !== CHECK_IN_NORMAL_VALUES[key]
        )
      );

      items.push({
        id: 'attention-days',
        tone: attentionCheckIns.length > 0 ? 'alert' : 'normal',
        text:
          attentionCheckIns.length > 0
            ? t('vetVisit.brief.attentionDays', { count: attentionCheckIns.length })
            : t('vetVisit.brief.noAttentionDays'),
        sourceIds: (attentionCheckIns.length > 0
          ? attentionCheckIns
          : selectedCheckIns
        ).map((checkIn) => `check-in:${checkIn.id}`),
      });
    }
  }

  if (selection.records) {
    const selectedRecords = records
      .filter((record) => isDateWithinRange(record.date, startDate, endDate))
      .sort((a, b) => b.date.localeCompare(a.date));

    for (const record of selectedRecords) {
      sources.push({
        id: `record:${record.id}`,
        kind: 'record',
        date: record.date,
        label: t('vetVisit.sources.record', {
          type: t(getRecordTypeLabelKey(record.type)),
        }),
        route: getRecordFormRoute(record.type, record.id) as Href,
      });
    }

    if (selectedRecords.length > 0) {
      items.push({
        id: 'recent-records',
        tone: 'neutral',
        text: t('vetVisit.brief.recentRecords', { count: selectedRecords.length }),
        sourceIds: selectedRecords.map((record) => `record:${record.id}`),
      });

      const weights = selectedRecords.filter(
        (record): record is Extract<PetRecord, { type: 'weight' }> =>
          record.type === 'weight'
      );
      if (weights.length > 0) {
        const latest = weights[0];
        items.push({
          id: 'latest-weight',
          tone: 'neutral',
          text: t('vetVisit.brief.latestWeight', {
            value: latest.metadata.value,
            unit: latest.metadata.unit,
          }),
          sourceIds: [`record:${latest.id}`],
        });
      }
    }
  }

  if (selection.medications) {
    const activePlans = medicationPlans
      .filter((plan) => isMedicationActiveWithinRange(plan, startDate, endDate))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const plan of activePlans) {
      sources.push({
        id: `medication:${plan.id}`,
        kind: 'medication',
        date: plan.startsOn,
        label: t('vetVisit.sources.medication', { name: plan.name }),
        route: `/medications/${plan.id}` as Href,
      });
    }

    if (activePlans.length > 0) {
      items.push({
        id: 'active-medications',
        tone: 'neutral',
        text: t('vetVisit.brief.activeMedications', {
          medications: activePlans
            .map((plan) => `${plan.name} (${plan.dosage} ${plan.unit})`)
            .join(', '),
        }),
        sourceIds: activePlans.map((plan) => `medication:${plan.id}`),
      });
    }
  }

  const normalizedQuestions = normalizeQuestions(questions);
  const normalizedReason = reason.trim();

  return {
    range,
    reason: normalizedReason,
    items,
    questions: normalizedQuestions,
    sources,
    isEmpty: items.length === 0 && normalizedQuestions.length === 0 && !normalizedReason,
  };
}
