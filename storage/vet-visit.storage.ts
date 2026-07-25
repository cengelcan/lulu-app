import type { VetVisit, VetVisitBundle, VetVisitQuestion, VetVisitStatus } from '@/types/vet-visit';

import { getDatabase } from './database';

type VisitRow = {
  id: string; pet_id: string; scheduled_at: string; provider_id: string | null;
  provider_name: string | null; reason: string; status: string;
  health_report_start_date: string | null; health_report_end_date: string | null;
  started_at: string | null; completed_at: string | null; created_at: string; updated_at: string;
};
type QuestionRow = {
  id: string; visit_id: string; text: string; answer: string | null; is_answered: number;
  sort_order: number; created_at: string; updated_at: string;
};

function mapVisit(row: VisitRow): VetVisit {
  return {
    id: row.id, petId: row.pet_id, scheduledAt: row.scheduled_at,
    providerId: row.provider_id, providerName: row.provider_name, reason: row.reason,
    status: row.status as VetVisitStatus,
    healthReportStartDate: row.health_report_start_date,
    healthReportEndDate: row.health_report_end_date, startedAt: row.started_at,
    completedAt: row.completed_at, createdAt: row.created_at, updatedAt: row.updated_at,
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
      `INSERT INTO vet_visits (id, pet_id, scheduled_at, provider_id, provider_name, reason, status,
        health_report_start_date, health_report_end_date, started_at, completed_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET pet_id=excluded.pet_id, scheduled_at=excluded.scheduled_at,
        provider_id=excluded.provider_id, provider_name=excluded.provider_name, reason=excluded.reason,
        status=excluded.status, health_report_start_date=excluded.health_report_start_date,
        health_report_end_date=excluded.health_report_end_date, started_at=excluded.started_at,
        completed_at=excluded.completed_at, updated_at=excluded.updated_at`,
      visit.id, visit.petId, visit.scheduledAt, visit.providerId, visit.providerName, visit.reason,
      visit.status, visit.healthReportStartDate, visit.healthReportEndDate, visit.startedAt,
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
  });
}

export async function getVetVisitBundle(id: string): Promise<VetVisitBundle | null> {
  const db = await getDatabase();
  const visit = await db.getFirstAsync<VisitRow>('SELECT * FROM vet_visits WHERE id = ?', id);
  if (!visit) return null;
  const questions = await db.getAllAsync<QuestionRow>(
    'SELECT * FROM vet_visit_questions WHERE visit_id = ? ORDER BY sort_order ASC, created_at ASC', id
  );
  return { visit: mapVisit(visit), questions: questions.map(mapQuestion) };
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
    bundles.push({ visit: mapVisit(visit), questions: questions.map(mapQuestion) });
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
