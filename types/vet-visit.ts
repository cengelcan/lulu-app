import type { Href } from 'expo-router';

import type { ReportDateRange } from '@/types/report';

export type VisitBriefSection = 'checkIns' | 'medications' | 'records';
export type VisitBriefSourceKind = 'checkIn' | 'medication' | 'record';

export type VisitBriefSelection = Record<VisitBriefSection, boolean>;

export type VisitBriefSource = {
  id: string;
  kind: VisitBriefSourceKind;
  date: string;
  label: string;
  route: Href;
};

export type VisitBriefItem = {
  id: string;
  tone: 'alert' | 'neutral' | 'normal';
  text: string;
  sourceIds: string[];
};

export type VisitBrief = {
  range: ReportDateRange;
  reason: string;
  items: VisitBriefItem[];
  questions: string[];
  sources: VisitBriefSource[];
  isEmpty: boolean;
};

export type VisitBriefDocumentLabels = {
  sectionTitle: string;
  reason: string;
  highlights: string;
  questions: string;
  disclaimer: string;
  sourceReferences: string;
};

export const DEFAULT_VISIT_BRIEF_SELECTION: VisitBriefSelection = {
  checkIns: true,
  medications: true,
  records: true,
};
