import type { InboxItem, InboxItemPriority } from '@/types/inbox';

const PRIORITY_ORDER: Record<InboxItemPriority, number> = {
  urgent: 0,
  normal: 1,
  low: 2,
};

export function sortInboxItems(items: InboxItem[]): InboxItem[] {
  return [...items].sort((left, right) => {
    const priorityDiff = PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return right.sortAt.localeCompare(left.sortAt);
  });
}
