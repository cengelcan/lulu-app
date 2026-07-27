import { supabase } from '@/lib/supabase';
import type { WeightUnitPreference } from '@/types/experience-preferences';

type RemoteWeightUnitRow = {
  weight_unit: string | null;
};

function isWeightUnit(value: unknown): value is WeightUnitPreference {
  return value === 'kg' || value === 'lb';
}

export async function pushWeightUnitPreference(
  userId: string,
  weightUnit: WeightUnitPreference
): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(
    { id: userId, weight_unit: weightUnit },
    { onConflict: 'id' }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function reconcileWeightUnitPreference(
  userId: string,
  localWeightUnit: WeightUnitPreference
): Promise<WeightUnitPreference> {
  const { data, error } = await supabase
    .from('profiles')
    .select('weight_unit')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const remoteWeightUnit = (data as RemoteWeightUnitRow | null)?.weight_unit;
  if (isWeightUnit(remoteWeightUnit)) {
    return remoteWeightUnit;
  }

  await pushWeightUnitPreference(userId, localWeightUnit);
  return localWeightUnit;
}
