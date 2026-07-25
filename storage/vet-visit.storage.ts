import type { VetVisit, VetVisitBundle, VetVisitOutcome, VetVisitQuestion, VetVisitStatus } from '@/types/vet-visit';

import { getDatabase } from './database';

type VisitRow = {
  id: string; pet_id: string; created_by_user_id: string | null; scheduled_at: string; provider_id: string | null;
  provider_name: string | null; reason: string; general_notes: string | null; status: string;
  health_report_start_date: string | null; health_report_end_date: string | null;
  started_at: string | null; completed_at: string | null; created_at: string; updated_at: string;
};
type OutcomeRow = {
  visit_id: string; user_entered_summary: string; treatment_notes: string | null;
  next_visit_at: string | null; follow_up_reminder_id: string | null;
  medication_plan_id: string | null; created_at: string; updated_at: string;
};
type QuestionRow = {
  id: string; visit_id: string; text: string; answer: string | null; is_answered: number;
  sort_order: number; created_at: string; updated_at: string;
};

function mapVisit(row: VisitRow): VetVisit {
  return {
    id: row.id, petId: row.pet_id, createdByUserId: row.created_by_user_id,
    scheduledAt: row.scheduled_at,
    providerId: row.provider_id, providerName: row.provider_name, reason: row.reason,
    generalNotes: row.general_notes,
    status: row.status as VetVisitStatus,
    healthReportStartDate: row.health_report_start_date,
    healthReportEndDate: row.health_report_end_date, startedAt: row.started_at,
    completedAt: row.completed_at, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapOutcome(row: OutcomeRow): VetVisitOutcome {
  return {
    visitId: row.visit_id, userEnteredSummary: row.user_entered_summary,
    treatmentNotes: row.treatment_notes, nextVisitAt: row.next_visit_at,
    followUpReminderId: row.follow_up_reminder_id, medicationPlanId: row.medication_plan_id,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapQuestion(row: QuestionRow): VetVisitQuestion {
  return {
    id: row.id, visitId: row.visit_id, text: row.text, answer: row.answer,
    isAnswered: row.is_answered === 1, sortOrder: row.sort_order,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export async function saveVetVisitBundle(bundle: VetVisitBundle): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    const visit = bundle.visit;
    await db.runAsync(
      `INSERT INTO vet_visits (id, pet_id, created_by_user_id, scheduled_at, provider_id, provider_name, reason, general_notes, status,
        health_report_start_date, health_report_end_date, started_at, completed_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET pet_id=excluded.pet_id, scheduled_at=excluded.scheduled_at,
        created_by_user_id=COALESCE(vet_visits.created_by_user_id, excluded.created_by_user_id),
        provider_id=excluded.provider_id, provider_name=excluded.provider_name, reason=excluded.reason,
        general_notes=excluded.general_notes, status=excluded.status,
        health_report_start_date=excluded.health_report_start_date,
        health_report_end_date=excluded.health_report_end_date, started_at=excluded.started_at,
        completed_at=excluded.completed_at, updated_at=excluded.updated_at`,
      visit.id, visit.petId, visit.createdByUserId, visit.scheduledAt, visit.providerId, visit.providerName, visit.reason,
      visit.generalNotes, visit.status, visit.healthReportStartDate, visit.healthReportEndDate, visit.startedAt,
      visit.completedAt, visit.createdAt, visit.updatedAt
    );
    await db.runAsync('DELETE FROM vet_visit_questions WHERE visit_id = ?', visit.id);
    for (const question of bundle.questions) {
      await db.runAsync(
        `INSERT INTO vet_visit_questions
          (id, visit_id, text, answer, is_answered, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        question.id, question.visitId, question.text, question.answer, question.isAnswered ? 1 : 0,
        question.sortOrder, question.createdAt, question.updatedAt
      );
    }
    if (bundle.outcome) {
      const outcome = bundle.outcome;
      await db.runAsync(
        `INSERT INTO vet_visit_outcomes
          (visit_id, user_entered_summary, treatment_notes, next_visit_at,
           follow_up_reminder_id, medication_plan_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(visit_id) DO UPDATE SET
          user_entered_summary=excluded.user_entered_summary,
          treatment_notes=excluded.treatment_notes,
          next_visit_at=excluded.next_visit_at,
          follow_up_reminder_id=excluded.follow_up_reminder_id,
          medication_plan_id=excluded.medication_plan_id,
          updated_at=excluded.updated_at`,
        outcome.visitId, outcome.userEnteredSummary, outcome.treatmentNotes, outcome.nextVisitAt,
        outcome.followUpReminderId, outcome.medicationPlanId,
        outcome.createdAt, outcome.updatedAt
      );
    }
  });
}

export async function getVetVisitBundle(id: string): Promise<VetVisitBundle | null> {
  const db = await getDatabase();
  const visit = await db.getFirstAsync<VisitRow>('SELECT * FROM vet_visits WHERE id = ?', id);
  if (!visit) return null;
  const questions = await db.getAllAsync<QuestionRow>(
    'SELECT * FROM vet_visit_questions WHERE visit_id = ? ORDER BY sort_order ASC, created_at ASC', id
  );
  const outcome = await db.getFirstAsync<OutcomeRow>(
    'SELECT * FROM vet_visit_outcomes WHERE visit_id = ?', id
  );
  return {
    visit: mapVisit(visit), questions: questions.map(mapQuestion),
    outcome: outcome ? mapOutcome(outcome) : null,
  };
}

export async function getVetVisitBundlesByPetId(petId: string): Promise<VetVisitBundle[]> {
  const db = await getDatabase();
  const visits = await db.getAllAsync<VisitRow>(
    'SELECT * FROM vet_visits WHERE pet_id = ? ORDER BY scheduled_at ASC', petId
  );
  const bundles: VetVisitBundle[] = [];
  for (const visit of visits) {
    const questions = await db.getAllAsync<QuestionRow>(
      'SELECT * FROM vet_visit_questions WHERE visit_id = ? ORDER BY sort_order ASC, created_at ASC', visit.id
    );
    const outcome = await db.getFirstAsync<OutcomeRow>(
      'SELECT * FROM vet_visit_outcomes WHERE visit_id = ?', visit.id
    );
    bundles.push({
      visit: mapVisit(visit), questions: questions.map(mapQuestion),
      outcome: outcome ? mapOutcome(outcome) : null,
    });
  }
  return bundles;
}

export async function getAllVetVisitBundles(): Promise<VetVisitBundle[]> {
  const db = await getDatabase();
  const visits = await db.getAllAsync<VisitRow>('SELECT * FROM vet_visits ORDER BY scheduled_at ASC');
  const bundles: VetVisitBundle[] = [];
  for (const visit of visits) {
    const bundle = await getVetVisitBundle(visit.id);
    if (bundle) bundles.push(bundle);
  }
  return bundles;
}

export async function deleteVetVisit(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM vet_visits WHERE id = ?', id);
}

export async function deleteAllVetVisits(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('DELETE FROM vet_visits');
}
