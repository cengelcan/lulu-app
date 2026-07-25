export type VetVisitStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export type VetVisit = {
  id: string;
  petId: string;
  scheduledAt: string;
  providerId: string | null;
  providerName: string | null;
  reason: string;
  status: VetVisitStatus;
  healthReportStartDate: string | null;
  healthReportEndDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
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
};
