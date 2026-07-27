import type { ContextualEducationTopic } from '@/storage/contextual-education.storage';

export type ContextualEducationDismissedState = Partial<
  Record<ContextualEducationTopic, true>
>;

const TOPICS: readonly ContextualEducationTopic[] = ['medication', 'family', 'vet_visit'];

export function normalizeContextualEducationDismissedState(
  value: unknown
): ContextualEducationDismissedState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const record = value as Record<string, unknown>;
  return Object.fromEntries(
    TOPICS.filter((topic) => record[topic] === true).map((topic) => [topic, true])
  ) as ContextualEducationDismissedState;
}
