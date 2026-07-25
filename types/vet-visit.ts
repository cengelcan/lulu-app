export type VetVisitStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export type VetVisit = {
  id: string;
  petId: string;
  createdByUserId: string | null;
  scheduledAt: string;
  providerId: string | null;
  providerName: string | null;
  reason: string;
  generalNotes: string | null;
  status: VetVisitStatus;
  healthReportStartDate: string | null;
  healthReportEndDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VetVisitOutcome = {
  visitId: string;
  userEnteredSummary: string;
  treatmentNotes: string | null;
  nextVisitAt: string | null;
  followUpReminderId: string | null;
  medicationPlanId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VetVisitQuestion = {
  id: string;
  visitId: string;
  text: string;
  answer: string | null;
  isAnswered: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type VetVisitBundle = {
  visit: VetVisit;
  questions: VetVisitQuestion[];
  outcome: VetVisitOutcome | null;
};
