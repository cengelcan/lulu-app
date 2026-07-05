export const INSTAGRAM_URL = 'https://instagram.com/lulupetapp';

export const SHARE_URL = 'https://lulu.app';

export const IOS_APP_STORE_ID = '6787669539';

/** Public App Store listing (QR codes, share links). */
export const APP_STORE_LISTING_URL = `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`;

/** Opens the App Store "Write a Review" screen when the in-app prompt is unavailable. */
export const APP_STORE_REVIEW_URL = `${APP_STORE_LISTING_URL}?action=write-review`;

/** Native App Store scheme fallback when the https link cannot be opened. */
export const APP_STORE_REVIEW_DEEP_LINK = `itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${IOS_APP_STORE_ID}?action=write-review`;
