export const LULU_PLUS_BENEFITS = [
  {
    titleKey: 'paywall.smartRemindersTitle',
    descriptionKey: 'paywall.smartRemindersDescription',
  },
  {
    titleKey: 'paywall.advancedReportsTitle',
    descriptionKey: 'paywall.advancedReportsDescription',
  },
  {
    titleKey: 'paywall.familySharingTitle',
    descriptionKey: 'paywall.familySharingDescription',
  },
  {
    titleKey: 'paywall.longerHistoryTitle',
    descriptionKey: 'paywall.longerHistoryDescription',
  },
  {
    titleKey: 'paywall.multiplePetsTitle',
    descriptionKey: 'paywall.multiplePetsDescription',
  },
] as const;

export type PlusBenefitTitleKey = (typeof LULU_PLUS_BENEFITS)[number]['titleKey'];
