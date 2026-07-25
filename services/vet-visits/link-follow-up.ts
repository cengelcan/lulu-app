import { trackVetVisitEvent } from '@/services/analytics/vet-visit';
import * as vetVisitStorage from '@/storage/vet-visit.storage';
import { useVetVisitStore } from '@/stores/vet-visit.store';
import { linkVetVisitFollowUp } from '@/utils/vet-visit';

export async function linkFollowUpToVetVisit(
  visitId: string,
  kind: 'reminder' | 'medication',
  entityId: string
): Promise<void> {
  const bundle = await vetVisitStorage.getVetVisitBundle(visitId);
  if (!bundle?.outcome) return;

  const linked = linkVetVisitFollowUp(bundle, kind, entityId, new Date().toISOString());
  await useVetVisitStore.getState().saveVisit(linked);
  await trackVetVisitEvent('follow_up_created', 'outcome', kind);
}
