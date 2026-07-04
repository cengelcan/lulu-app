export type PetMembershipRole = 'member';

export type FamilyGroup = {
  id: string;
  ownerUserId: string;
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
  | 'invite_accepted'
  | 'member_left';

export type ActivityEvent = {
  id: string;
  petId: string;
  actorUserId: string;
  eventType: ActivityEventType;
  metadata: Record<string, unknown>;
  createdAt: string;
};
