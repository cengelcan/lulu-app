export type PetMembershipRole = 'member';

export type FamilyGroup = {
  id: string;
  ownerUserId: string;
  name: string;
  iconKey: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  rotatedAt: string | null;
};

export type FamilyGroupPet = {
  familyGroupId: string;
  petId: string;
};

export type PetMembership = {
  id: string;
  petId: string;
  memberUserId: string;
  role: PetMembershipRole;
  familyGroupId: string;
  joinedAt: string;
};

export type FamilyMemberSummary = {
  membershipId: string;
  memberUserId: string;
  displayName: string | null;
  joinedAt: string;
  petIds: string[];
};

export type FamilyJoinPreview = {
  familyGroupId: string;
  ownerUserId: string;
  ownerDisplayName: string | null;
  pets: Array<{ id: string; name: string; species: string }>;
};

export type ActivityEventType =
  | 'check_in_created'
  | 'check_in_updated'
  | 'record_created'
  | 'reminder_completed'
  | 'dose_taken'
  | 'dose_skipped'
  | 'dose_snoozed'
  | 'medication_refilled'
  | 'sharing_updated'
  | 'invite_accepted'
  | 'member_left';

export type ActivityEvent = {
  id: string;
  familyId?: string | null;
  petId: string;
  actorUserId: string;
  eventType: ActivityEventType;
  entityId?: string | null;
  metadata: Record<string, unknown>;
  metadataVersion: number;
  occurredAt: string;
  createdAt: string;
};

export type ActivityEventCursor = {
  occurredAt: string;
  id: string;
};

export type ActivityEventPage = {
  events: ActivityEvent[];
  nextCursor: ActivityEventCursor | null;
};
