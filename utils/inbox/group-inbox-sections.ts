import type { InboxItem, InboxItemCategory, InboxSection } from '@/types/inbox';

const SECTION_ORDER: InboxItemCategory[] = ['action_required', 'upcoming', 'activity'];

const SECTION_TITLE_KEYS: Record<InboxItemCategory, string> = {
  action_required: 'inbox.sections.actionRequired',
  upcoming: 'inbox.sections.upcoming',
  activity: 'inbox.sections.familyActivity',
};

export function groupInboxSections(items: InboxItem[]): InboxSection[] {
  const grouped = new Map<InboxItemCategory, InboxItem[]>();

  for (const item of items) {
    const sectionItems = grouped.get(item.category) ?? [];
    sectionItems.push(item);
    grouped.set(item.category, sectionItems);
  }

  return SECTION_ORDER.flatMap((category) => {
    const sectionItems = grouped.get(category);
    if (!sectionItems || sectionItems.length === 0) {
      return [];
    }

    return [
      {
        category,
        titleKey: SECTION_TITLE_KEYS[category],
        items: sectionItems,
      },
    ];
  });
}

export function countActionRequiredItems(items: InboxItem[]): number {
  return items.filter((item) => item.category === 'action_required').length;
}
