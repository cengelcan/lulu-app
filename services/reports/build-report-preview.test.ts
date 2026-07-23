import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createDefaultReportDataSelection } from '@/constants/reports';
import { buildReportPreviewContent } from '@/services/reports/build-report-preview';
import type { MedicationDose, MedicationPlan } from '@/types/medication';

const plan: MedicationPlan = {
  id: 'plan-1', petId: 'pet-1', name: 'Metronidazole', dosage: '1', unit: 'tablet',
  startsOn: '2026-06-01', timezone: 'Europe/Berlin', isPrn: false, status: 'active',
  createdAt: '2026-06-01T08:00:00.000Z', updatedAt: '2026-06-01T08:00:00.000Z',
};

const dose: MedicationDose = {
  id: 'dose-1', planId: plan.id, petId: plan.petId,
  scheduledAt: '2026-06-23T07:00:00.000Z', localDate: '2026-06-23',
  localTime: { hour: 9, minute: 0 }, timezone: 'Europe/Berlin', status: 'taken',
  completedAt: '2026-06-23T07:02:00.000Z', createdAt: '2026-06-20T08:00:00.000Z',
  updatedAt: '2026-06-23T07:02:00.000Z',
};

describe('buildReportPreviewContent medication integration', () => {
  it('adds resolved doses to the veterinary timeline', () => {
    const content = buildReportPreviewContent({
      range: { preset: 'custom', startDate: '2026-06-20', endDate: '2026-06-25' },
      selection: createDefaultReportDataSelection(), checkIns: [], records: [],
      medicationPlans: [plan], medicationDoses: [dose], locale: 'en-US',
      t: (key, params) => params ? `${key}:${JSON.stringify(params)}` : key,
    });

    assert.equal(content.isEmpty, false);
    assert.equal(content.recordGroups[0]?.entries[0]?.typeId, 'medicationDose');
    assert.match(content.recordGroups[0]?.entries[0]?.detail ?? '', /Metronidazole/);
  });

  it('omits medication history when the report option is disabled', () => {
    const selection = { ...createDefaultReportDataSelection(), medications: false };
    const content = buildReportPreviewContent({
      range: { preset: 'custom', startDate: '2026-06-20', endDate: '2026-06-25' },
      selection, checkIns: [], records: [], medicationPlans: [plan], medicationDoses: [dose],
      locale: 'en-US', t: (key) => key,
    });
    assert.equal(content.isEmpty, true);
  });
});
