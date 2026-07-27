import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createDefaultReportDataSelection } from '@/constants/reports';
import { buildReportPreviewContent } from '@/services/reports/build-report-preview';
import type { MedicationDose, MedicationPlan } from '@/types/medication';
import type { PetRecord } from '@/types/pet-record';
import type { RegionalFormatContext } from '@/utils/regional-format';

const regionalFormat: RegionalFormatContext = {
  language: 'en', languageLocale: 'en-US', regionCode: 'US', datePartOrder: 'mdy',
  dateSeparator: '/', decimalSeparator: '.', digitGroupingSeparator: ',',
  measurementSystem: 'us', uses24HourClock: false, timeZone: 'UTC',
};
const turkeyEnglishRegionalFormat: RegionalFormatContext = {
  ...regionalFormat,
  regionCode: 'TR', datePartOrder: 'dmy', dateSeparator: '.',
  decimalSeparator: ',', digitGroupingSeparator: '.', measurementSystem: 'metric',
  uses24HourClock: true, timeZone: 'Europe/Istanbul',
};

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
      medicationPlans: [plan], medicationDoses: [dose], regionalFormat,
      t: (key, params) => params ? `${key}:${JSON.stringify(params)}` : key,
    });

    assert.equal(content.isEmpty, false);
    assert.equal(content.recordGroups[0]?.entries[0]?.typeId, 'medicationDose');
    assert.match(content.recordGroups[0]?.entries[0]?.time ?? '', /07:02\s?AM/i);
    assert.match(content.recordGroups[0]?.entries[0]?.detail ?? '', /Metronidazole/);
  });

  it('omits medication history when the report option is disabled', () => {
    const selection = { ...createDefaultReportDataSelection(), medications: false };
    const content = buildReportPreviewContent({
      range: { preset: 'custom', startDate: '2026-06-20', endDate: '2026-06-25' },
      selection, checkIns: [], records: [], medicationPlans: [plan], medicationDoses: [dose],
      regionalFormat, t: (key) => key,
    });
    assert.equal(content.isEmpty, true);
  });
});

describe('buildReportPreviewContent weight preference', () => {
  it('formats a weight record in the selected display unit without mutating its source', () => {
    const weightRecord: PetRecord = {
      id: 'weight-1',
      petId: 'pet-1',
      type: 'weight',
      date: '2026-06-23',
      metadata: { value: 4.75, unit: 'kg' },
      notes: null,
      createdAt: '2026-06-23T07:00:00.000Z',
      updatedAt: '2026-06-23T07:00:00.000Z',
    };
    const content = buildReportPreviewContent({
      range: { preset: 'custom', startDate: '2026-06-20', endDate: '2026-06-25' },
      selection: createDefaultReportDataSelection(),
      checkIns: [],
      records: [weightRecord],
      regionalFormat: turkeyEnglishRegionalFormat,
      weightUnit: 'lb',
      t: (key, params) => {
        if (key === 'records.units.lb') return 'lb';
        if (key === 'records.summary.weightValue') return `${params?.value} ${params?.unit}`;
        return key;
      },
    });

    assert.equal(content.recordGroups[0]?.entries[0]?.detail, '10,5 lb');
    assert.deepEqual(weightRecord.metadata, { value: 4.75, unit: 'kg' });
  });
});
