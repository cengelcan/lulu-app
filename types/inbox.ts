import type { Href } from 'expo-router';

import type { NotificationPermissionStatus } from '@/storage/prefs.storage';
import type { ActivityEvent } from '@/types/sharing';
import type { CheckIn } from '@/types/check-in';
import type { Pet } from '@/types/pet';
import type { PetReminder } from '@/types/pet-reminder';
import type { VetVisitBundle } from '@/types/vet-visit';
import type { RegionalFormatContext } from '@/utils/regional-format';

export type InboxTranslateFn = (
  key: string,
  params?: Record<string, string | number>
) => string;

/** v1: only `personal`. Family sharing adds `family`. */
export type InboxItemSource = 'personal' | 'family';

export type InboxItemCategory = 'action_required' | 'upcoming' | 'activity';

export type InboxItemKind =
  | 'missed_check_in_today'
  | 'missed_check_in_yesterday'
  | 'overdue_reminder'
  | 'upcoming_reminder'
  | 'notification_permission_denied'
  | 'completed_vet_visit'
  | 'family_check_in_created'
  | 'family_check_in_updated'
  | 'family_record_created'
  | 'family_reminder_completed'
  | 'family_dose_taken'
  | 'family_dose_skipped'
  | 'family_dose_snoozed'
  | 'family_medication_refilled'
  | 'family_sharing_updated'
  | 'family_invite_sent'
  | 'family_invite_accepted'
  | 'family_member_left';

export type InboxItemPriority = 'urgent' | 'normal' | 'low';

export type InboxItem = {
  id: string;
  source: InboxItemSource;
  category: InboxItemCategory;
  kind: InboxItemKind;
  priority: InboxItemPriority;
  petId: string | null;
  petName: string | null;
  titleKey: string;
  titleParams?: Record<string, string>;
  subtitleKey?: string;
  subtitleParams?: Record<string, string>;
  subtitleText?: string;
  route: Href;
  sortAt: string;
  createdAt: string;
  actorUserId?: string;
  actorDisplayName?: string;
  isUnread?: boolean;
};

export type InboxSection = {
  category: InboxItemCategory;
  titleKey: string;
  items: InboxItem[];
};

export type InboxProviderInput = {
  pets: Pet[];
  checkIns: CheckIn[];
  reminders: PetReminder[];
  vetVisits: VetVisitBundle[];
  permission: NotificationPermissionStatus | null;
  dismissedIds: Set<string>;
  referenceDate: Date;
  regionalFormat: RegionalFormatContext;
  t: InboxTranslateFn;
  activityEvents?: ActivityEvent[];
  currentUserId?: string | null;
  actorDisplayNames?: Map<string, string | null>;
};

export type InboxProvider = (input: InboxProviderInput) => InboxItem[];
