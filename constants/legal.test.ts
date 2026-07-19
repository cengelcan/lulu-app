import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getLegalUrls } from '@/constants/legal';

describe('getLegalUrls', () => {
  it('builds English legal URLs', () => {
    assert.deepEqual(getLegalUrls('en'), {
      privacyPolicy: 'https://lulu.pet/en/privacy-policy/',
      terms: 'https://lulu.pet/en/terms/',
    });
  });

  it('builds German legal URLs', () => {
    assert.deepEqual(getLegalUrls('de'), {
      privacyPolicy: 'https://lulu.pet/de/privacy-policy/',
      terms: 'https://lulu.pet/de/terms/',
    });
  });

  it('builds Turkish legal URLs', () => {
    assert.deepEqual(getLegalUrls('tr'), {
      privacyPolicy: 'https://lulu.pet/tr/privacy-policy/',
      terms: 'https://lulu.pet/tr/terms/',
    });
  });
});
