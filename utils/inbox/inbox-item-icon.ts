import type { InboxItemKind } from '@/types/inbox';
import type { IconSymbolName } from '@/components/ui/icon-symbol';

const INBOX_ITEM_ICONS: Record<InboxItemKind, IconSymbolName> = {
  missed_check_in_today: 'heart.fill',
  missed_check_in_yesterday: 'heart.fill',
  overdue_reminder: 'exclamationmark.triangle',
  upcoming_reminder: 'calendar',
  notification_permission_denied: 'bell.fill',
  family_check_in_created: 'heart.fill',
  family_check_in_updated: 'heart.fill',
  family_record_created: 'doc.text.fill',
  family_reminder_completed: 'calendar.badge.checkmark',
  family_invite_sent: 'person.fill',
  family_invite_accepted: 'person.fill',
  family_member_left: 'person.fill',
};

export function getInboxItemIcon(kind: InboxItemKind): IconSymbolName {
  return INBOX_ITEM_ICONS[kind];
}
