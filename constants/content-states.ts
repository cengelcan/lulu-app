export const CONTENT_STATE_KINDS = ['loading', 'error', 'empty', 'locked'] as const;

export type ContentStateKind = (typeof CONTENT_STATE_KINDS)[number];
