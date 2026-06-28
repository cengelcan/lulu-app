import { supabase } from '@/lib/supabase';
import * as checkInStorage from '@/storage/check-in.storage';
import type { CheckIn } from '@/types/check-in';

type RemoteCheckInRow = {
  id: string;
  user_id: string;
  pet_id: string;
  date: string;
  appetite: string;
  water_intake: string | null;
  energy: string;
  mood: string | null;
  pee: string | null;
  poop: string | null;
  notes: string | null;
  created_at: string;
};

function toRemoteRow(checkIn: CheckIn, userId: string): Record<string, unknown> {
  return {
    id: checkIn.id,
    user_id: userId,
    pet_id: checkIn.petId,
    date: checkIn.date,
    appetite: checkIn.appetite,
    water_intake: checkIn.waterIntake,
    energy: checkIn.energy,
    mood: checkIn.mood,
    pee: checkIn.pee,
    poop: checkIn.poop,
    notes: checkIn.notes ?? null,
    created_at: checkIn.createdAt,
  };
}

function fromRemoteRow(row: RemoteCheckInRow): CheckIn {
  return {
    id: row.id,
    petId: row.pet_id,
    date: row.date,
    appetite: normalizeLegacyAppetite(row.appetite),
    waterIntake: normalizeLegacyWaterIntake(row.water_intake),
    energy: normalizeLegacyEnergy(row.energy),
    mood: normalizeLegacyMood(row.mood),
    pee: normalizeLegacyPee(row.pee),
    poop: normalizeLegacyPoop(row.poop),
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function normalizeLegacyAppetite(value: string): CheckIn['appetite'] {
  switch (value) {
    case 'less':
    case 'normal':
    case 'more':
      return value;
    case 'no_appetite':
    case 'reduced':
    case 'not_eating':
      return 'less';
    case 'increased':
    case 'good':
      return 'more';
    default:
      return 'normal';
  }
}

function normalizeLegacyWaterIntake(value: string | null): CheckIn['waterIntake'] {
  switch (value) {
    case 'less':
    case 'normal':
    case 'more':
      return value;
    case 'very_low':
    case 'low':
      return 'less';
    case 'high':
    case 'very_high':
      return 'more';
    default:
      return 'normal';
  }
}

function normalizeLegacyEnergy(value: string): CheckIn['energy'] {
  switch (value) {
    case 'low':
    case 'normal':
    case 'high':
      return value;
    case 'very_low':
      return 'low';
    case 'very_high':
      return 'high';
    default:
      return 'normal';
  }
}

function normalizeLegacyMood(value: string | null): CheckIn['mood'] {
  switch (value) {
    case 'low':
    case 'normal':
    case 'high':
      return value;
    case 'restless':
    case 'irritable':
      return 'low';
    case 'happy':
    case 'playful':
      return 'high';
    default:
      return 'normal';
  }
}

function normalizeLegacyPee(value: string | null): CheckIn['pee'] {
  switch (value) {
    case 'not_observed':
    case 'normal':
    case 'not_normal':
      return value;
    case 'straining':
    case 'less_than_normal':
    case 'more_than_normal':
      return 'not_normal';
    default:
      return 'normal';
  }
}

function normalizeLegacyPoop(value: string | null): CheckIn['poop'] {
  switch (value) {
    case 'not_observed':
    case 'normal':
    case 'not_normal':
      return value;
    case 'diarrhea':
    case 'soft':
    case 'hard':
    case 'none':
      return 'not_normal';
    default:
      return 'normal';
  }
}

export async function fetchRemoteCheckIns(userId: string): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as RemoteCheckInRow[]).map(fromRemoteRow);
}

export async function pushCheckIn(userId: string, checkIn: CheckIn): Promise<void> {
  const { error } = await supabase.from('check_ins').upsert(toRemoteRow(checkIn, userId), {
    onConflict: 'id',
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteRemoteCheckIn(id: string): Promise<void> {
  const { error } = await supabase.from('check_ins').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Reconciles local check-ins with Supabase (the source of truth).
 *
 * Transition case: when the cloud has none yet but the device has local
 * check-ins, those are pushed up (claimed for this user). Otherwise the local
 * cache is replaced with the cloud rows.
 *
 * Must run AFTER pets are pulled so the cloud FK (check_ins.pet_id → pets.id)
 * is satisfied when pushing local rows up.
 */
export async function pullCheckInsIntoLocal(userId: string): Promise<CheckIn[]> {
  const remoteCheckIns = await fetchRemoteCheckIns(userId);

  if (remoteCheckIns.length === 0) {
    const localCheckIns = await checkInStorage.getAllCheckIns();

    if (localCheckIns.length > 0) {
      for (const checkIn of localCheckIns) {
        await pushCheckIn(userId, checkIn);
      }

      return localCheckIns;
    }

    return [];
  }

  await checkInStorage.deleteAllCheckIns();
  for (const checkIn of remoteCheckIns) {
    await checkInStorage.createCheckIn(checkIn);
  }

  return remoteCheckIns;
}
