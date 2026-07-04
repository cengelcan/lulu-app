import { supabase } from '@/lib/supabase';
import type {
  FamilyGroup,
  FamilyJoinPreview,
  FamilyMemberSummary,
  PetMembership,
} from '@/types/sharing';
import { generateFamilyCode, normalizeFamilyCode } from '@/utils/sharing/family-code';

type RemoteFamilyGroupRow = {
  id: string;
  owner_user_id: string;
  code: string;
  is_active: boolean;
  created_at: string;
  rotated_at: string | null;
};

type RemoteMembershipRow = {
  id: string;
  pet_id: string;
  member_user_id: string;
  role: 'member';
  family_group_id: string;
  joined_at: string;
};

function fromFamilyGroupRow(row: RemoteFamilyGroupRow): FamilyGroup {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    code: row.code,
    isActive: row.is_active,
    createdAt: row.created_at,
    rotatedAt: row.rotated_at,
  };
}

function fromMembershipRow(row: RemoteMembershipRow): PetMembership {
  return {
    id: row.id,
    petId: row.pet_id,
    memberUserId: row.member_user_id,
    role: row.role,
    familyGroupId: row.family_group_id,
    joinedAt: row.joined_at,
  };
}

export async function fetchOwnerFamilyGroup(userId: string): Promise<FamilyGroup | null> {
  const { data, error } = await supabase
    .from('family_groups')
    .select('*')
    .eq('owner_user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? fromFamilyGroupRow(data as RemoteFamilyGroupRow) : null;
}

export async function fetchFamilyGroupPetIds(familyGroupId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('family_group_pets')
    .select('pet_id')
    .eq('family_group_id', familyGroupId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.pet_id as string);
}

export async function fetchMemberPetIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('pet_memberships')
    .select('pet_id')
    .eq('member_user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.pet_id as string);
}

export async function createFamilyGroup(userId: string): Promise<FamilyGroup> {
  const existing = await fetchOwnerFamilyGroup(userId);

  if (existing) {
    return existing;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateFamilyCode();
    const { data, error } = await supabase
      .from('family_groups')
      .insert({
        owner_user_id: userId,
        code,
        is_active: true,
      })
      .select('*')
      .single();

    if (!error && data) {
      return fromFamilyGroupRow(data as RemoteFamilyGroupRow);
    }

    if (error?.code !== '23505') {
      throw new Error(error?.message ?? 'Failed to create family group');
    }
  }

  throw new Error('Failed to generate a unique family code');
}

export async function rotateFamilyCode(familyGroupId: string): Promise<FamilyGroup> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateFamilyCode();
    const { data, error } = await supabase
      .from('family_groups')
      .update({
        code,
        rotated_at: new Date().toISOString(),
      })
      .eq('id', familyGroupId)
      .select('*')
      .single();

    if (!error && data) {
      return fromFamilyGroupRow(data as RemoteFamilyGroupRow);
    }

    if (error?.code !== '23505') {
      throw new Error(error?.message ?? 'Failed to rotate family code');
    }
  }

  throw new Error('Failed to generate a unique family code');
}

export async function deactivateFamilyGroup(familyGroupId: string): Promise<void> {
  const { error } = await supabase
    .from('family_groups')
    .update({ is_active: false })
    .eq('id', familyGroupId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateFamilyGroupPets(
  familyGroupId: string,
  petIds: string[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('family_group_pets')
    .delete()
    .eq('family_group_id', familyGroupId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (petIds.length === 0) {
    return;
  }

  const rows = petIds.map((petId) => ({
    family_group_id: familyGroupId,
    pet_id: petId,
  }));

  const { error: insertError } = await supabase.from('family_group_pets').insert(rows);

  if (insertError) {
    throw new Error(insertError.message);
  }
}

export async function previewFamilyJoin(code: string): Promise<FamilyJoinPreview> {
  const { data, error } = await supabase.rpc('preview_family_join', {
    p_code: normalizeFamilyCode(code),
  });

  if (error) {
    throw new Error(error.message);
  }

  const payload = data as {
    familyGroupId: string;
    ownerUserId: string;
    ownerDisplayName: string | null;
    pets: Array<{ id: string; name: string; species: string }>;
  };

  return {
    familyGroupId: payload.familyGroupId,
    ownerUserId: payload.ownerUserId,
    ownerDisplayName: payload.ownerDisplayName,
    pets: payload.pets,
  };
}

export async function acceptFamilyJoin(code: string): Promise<number> {
  const { data, error } = await supabase.rpc('accept_family_join', {
    p_code: normalizeFamilyCode(code),
  });

  if (error) {
    throw new Error(error.message);
  }

  const payload = data as { joinedPetCount: number };
  return payload.joinedPetCount;
}

export async function leaveFamilyGroup(familyGroupId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('pet_memberships')
    .delete()
    .eq('family_group_id', familyGroupId)
    .eq('member_user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeFamilyMember(membershipId: string): Promise<void> {
  const { error } = await supabase.from('pet_memberships').delete().eq('id', membershipId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchFamilyMembers(
  familyGroupId: string
): Promise<FamilyMemberSummary[]> {
  const { data: memberships, error } = await supabase
    .from('pet_memberships')
    .select('id, pet_id, member_user_id, joined_at')
    .eq('family_group_id', familyGroupId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (memberships ?? []) as Array<{
    id: string;
    pet_id: string;
    member_user_id: string;
    joined_at: string;
  }>;

  if (rows.length === 0) {
    return [];
  }

  const memberIds = [...new Set(rows.map((row) => row.member_user_id))];
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', memberIds);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id as string, profile.display_name as string | null])
  );

  const grouped = new Map<string, FamilyMemberSummary>();

  for (const row of rows) {
    const existing = grouped.get(row.member_user_id);

    if (existing) {
      existing.petIds.push(row.pet_id);
      continue;
    }

    grouped.set(row.member_user_id, {
      membershipId: row.id,
      memberUserId: row.member_user_id,
      displayName: profileMap.get(row.member_user_id) ?? null,
      joinedAt: row.joined_at,
      petIds: [row.pet_id],
    });
  }

  return [...grouped.values()].sort(
    (left, right) => new Date(left.joinedAt).getTime() - new Date(right.joinedAt).getTime()
  );
}

export async function fetchMembershipsForUser(userId: string): Promise<PetMembership[]> {
  const { data, error } = await supabase
    .from('pet_memberships')
    .select('*')
    .eq('member_user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data as RemoteMembershipRow[]).map(fromMembershipRow);
}

export async function logActivityEvent(input: {
  id: string;
  petId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { error } = await supabase.rpc('log_activity_event', {
    p_id: input.id,
    p_pet_id: input.petId,
    p_event_type: input.eventType,
    p_metadata: input.metadata ?? {},
  });

  if (error) {
    console.warn('Failed to log activity event', error.message);
  }
}
