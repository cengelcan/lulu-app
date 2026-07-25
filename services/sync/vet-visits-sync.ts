import { supabase } from '@/lib/supabase';
import { getLocalOwnedPetIds } from '@/services/sync/local-owned-pet-ids';
import * as vetVisitStorage from '@/storage/vet-visit.storage';
import type { VetVisitBundle, VetVisitOutcome, VetVisitQuestion, VetVisitStatus } from '@/types/vet-visit';

type RemoteVisitRow = {
  id: string; user_id: string; pet_id: string; scheduled_at: string;
  provider_id: string | null; provider_name: string | null; reason: string;
  general_notes: string | null; status: string;
  health_report_start_date: string | null; health_report_end_date: string | null;
  started_at: string | null; completed_at: string | null; created_at: string; updated_at: string;
};
type RemoteOutcomeRow = {
  visit_id: string; user_entered_summary: string; treatment_notes: string | null;
  next_visit_at: string | null; follow_up_reminder_id: string | null;
  medication_plan_id: string | null; created_at: string; updated_at: string;
};
type RemoteQuestionRow = {
  id: string; visit_id: string; text: string; answer: string | null; is_answered: boolean;
  sort_order: number; created_at: string; updated_at: string;
};

function toVisitRow(bundle: VetVisitBundle, userId: string): Record<string, unknown> {
  const visit = bundle.visit;
  return {
    id: visit.id, user_id: visit.createdByUserId ?? userId, pet_id: visit.petId,
    scheduled_at: visit.scheduledAt,
    provider_id: visit.providerId, provider_name: visit.providerName, reason: visit.reason,
    general_notes: visit.generalNotes,
    status: visit.status, health_report_start_date: visit.healthReportStartDate,
    health_report_end_date: visit.healthReportEndDate, started_at: visit.startedAt,
    completed_at: visit.completedAt, created_at: visit.createdAt, updated_at: visit.updatedAt,
  };
}

function toOutcomeRow(outcome: VetVisitOutcome): Record<string, unknown> {
  return {
    visit_id: outcome.visitId, user_entered_summary: outcome.userEnteredSummary,
    treatment_notes: outcome.treatmentNotes, next_visit_at: outcome.nextVisitAt,
    follow_up_reminder_id: outcome.followUpReminderId,
    medication_plan_id: outcome.medicationPlanId,
    created_at: outcome.createdAt, updated_at: outcome.updatedAt,
  };
}

function toQuestionRow(question: VetVisitQuestion): Record<string, unknown> {
  return {
    id: question.id, visit_id: question.visitId, text: question.text, answer: question.answer,
    is_answered: question.isAnswered, sort_order: question.sortOrder,
    created_at: question.createdAt, updated_at: question.updatedAt,
  };
}

function fromRows(
  row: RemoteVisitRow,
  questions: RemoteQuestionRow[],
  outcomes: RemoteOutcomeRow[]
): VetVisitBundle {
  const outcome = outcomes.find((item) => item.visit_id === row.id);
  return {
    visit: {
      id: row.id, petId: row.pet_id, createdByUserId: row.user_id, scheduledAt: row.scheduled_at,
      providerId: row.provider_id, providerName: row.provider_name, reason: row.reason,
      generalNotes: row.general_notes,
      status: row.status as VetVisitStatus,
      healthReportStartDate: row.health_report_start_date,
      healthReportEndDate: row.health_report_end_date, startedAt: row.started_at,
      completedAt: row.completed_at, createdAt: row.created_at, updatedAt: row.updated_at,
    },
    questions: questions
      .filter((question) => question.visit_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((question) => ({
        id: question.id, visitId: question.visit_id, text: question.text, answer: question.answer,
        isAnswered: question.is_answered, sortOrder: question.sort_order,
        createdAt: question.created_at, updatedAt: question.updated_at,
      })),
    outcome: outcome ? {
      visitId: outcome.visit_id, userEnteredSummary: outcome.user_entered_summary,
      treatmentNotes: outcome.treatment_notes, nextVisitAt: outcome.next_visit_at,
      followUpReminderId: outcome.follow_up_reminder_id,
      medicationPlanId: outcome.medication_plan_id,
      createdAt: outcome.created_at, updatedAt: outcome.updated_at,
    } : null,
  };
}

export async function fetchRemoteVetVisits(): Promise<VetVisitBundle[]> {
  const { data: visits, error: visitError } = await supabase
    .from('vet_visits').select('*').order('scheduled_at', { ascending: true });
  if (visitError) throw new Error(visitError.message);
  const { data: questions, error: questionError } = await supabase
    .from('vet_visit_questions').select('*').order('sort_order', { ascending: true });
  if (questionError) throw new Error(questionError.message);
  const { data: outcomes, error: outcomeError } = await supabase
    .from('vet_visit_outcomes').select('*');
  if (outcomeError) throw new Error(outcomeError.message);
  return (visits as RemoteVisitRow[]).map((visit) =>
    fromRows(visit, questions as RemoteQuestionRow[], outcomes as RemoteOutcomeRow[])
  );
}

export async function pushVetVisit(userId: string, bundle: VetVisitBundle): Promise<void> {
  const { error: visitError } = await supabase.from('vet_visits')
    .upsert(toVisitRow(bundle, userId), { onConflict: 'id' });
  if (visitError) throw new Error(visitError.message);

  const { error: deleteError } = await supabase.from('vet_visit_questions')
    .delete().eq('visit_id', bundle.visit.id);
  if (deleteError) throw new Error(deleteError.message);

  if (bundle.questions.length > 0) {
    const { error: questionError } = await supabase.from('vet_visit_questions')
      .upsert(bundle.questions.map(toQuestionRow), { onConflict: 'id' });
    if (questionError) throw new Error(questionError.message);
  }

  if (bundle.outcome) {
    const { error: outcomeError } = await supabase.from('vet_visit_outcomes')
      .upsert(toOutcomeRow(bundle.outcome), { onConflict: 'visit_id' });
    if (outcomeError) throw new Error(outcomeError.message);
  }
}

export async function deleteRemoteVetVisit(id: string): Promise<void> {
  const { error } = await supabase.from('vet_visits').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function pullVetVisitsIntoLocal(userId: string): Promise<VetVisitBundle[]> {
  const remote = await fetchRemoteVetVisits();
  if (remote.length === 0) {
    const local = await vetVisitStorage.getAllVetVisitBundles();
    const ownedPetIds = await getLocalOwnedPetIds();
    const claimable = local.filter(({ visit }) => ownedPetIds.has(visit.petId));
    for (const bundle of claimable) await pushVetVisit(userId, bundle);
    if (local.length !== claimable.length) {
      await vetVisitStorage.deleteAllVetVisits();
      for (const bundle of claimable) await vetVisitStorage.saveVetVisitBundle(bundle);
    }
    return claimable;
  }

  await vetVisitStorage.deleteAllVetVisits();
  for (const bundle of remote) await vetVisitStorage.saveVetVisitBundle(bundle);
  return remote;
}
