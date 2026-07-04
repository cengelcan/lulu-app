import type { Href } from 'expo-router';

import type { NotificationPermissionStatus } from '@/storage/prefs.storage';
import type { ActivityEvent } from '@/types/sharing';
import type { CheckIn } from '@/types/check-in';
import type { Pet } from '@/types/pet';
import type { PetReminder } from '@/types/pet-reminder';

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
  | 'family_check_in_created'
  | 'family_check_in_updated'
  | 'family_record_created'
  | 'family_reminder_completed'
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
  route: Href;
  sortAt: string;
  createdAt: string;
  actorUserId?: string;
  actorDisplayName?: string;
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
  permission: NotificationPermissionStatus | null;
  dismissedIds: Set<string>;
  referenceDate: Date;
  locale: string;
  t: InboxTranslateFn;
  activityEvents?: ActivityEvent[];
  currentUserId?: string | null;
  actorDisplayNames?: Map<string, string | null>;
};

export type InboxProvider = (input: InboxProviderInput) => InboxItem[];
