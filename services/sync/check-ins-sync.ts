import { supabase } from '@/lib/supabase';
import * as checkInStorage from '@/storage/check-in.storage';
import type {
  Appetite,
  CheckIn,
  Energy,
  Mood,
  Pee,
  Poop,
  WaterIntake,
} from '@/types/check-in';

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
    appetite: row.appetite as Appetite,
    waterIntake: (row.water_intake as WaterIntake | null) ?? 'normal',
    energy: row.energy as Energy,
    mood: (row.mood as Mood | null) ?? 'normal',
    pee: (row.pee as Pee | null) ?? 'normal',
    poop: (row.poop as Poop | null) ?? 'normal',
    notes: row.notes,
    createdAt: row.created_at,
  };
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
