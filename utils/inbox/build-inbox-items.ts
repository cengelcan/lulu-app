import type { InboxItem, InboxProvider, InboxProviderInput, InboxSection } from '@/types/inbox';

import { countActionRequiredItems, groupInboxSections } from '@/utils/inbox/group-inbox-sections';
import { buildFamilyActivityItems } from '@/utils/inbox/providers/family-activity-provider';
import { buildPersonalActionItems } from '@/utils/inbox/providers/personal-action-provider';
import { sortInboxItems } from '@/utils/inbox/sort-inbox-items';

const PROVIDERS: InboxProvider[] = [buildPersonalActionItems, buildFamilyActivityItems];

export function buildInboxItems(input: InboxProviderInput): InboxSection[] {
  const items = PROVIDERS.flatMap((provider) => provider(input)).filter(
    (item) => !input.dismissedIds.has(item.id)
  );

  return groupInboxSections(sortInboxItems(items));
}

export function flattenInboxItems(sections: InboxSection[]): InboxItem[] {
  return sections.flatMap((section) => section.items);
}

export function getActionRequiredCount(sections: InboxSection[]): number {
  return countActionRequiredItems(flattenInboxItems(sections));
}
