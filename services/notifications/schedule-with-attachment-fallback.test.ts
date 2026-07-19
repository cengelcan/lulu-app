import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { scheduleWithAttachmentFallback } from '@/services/notifications/schedule-with-attachment-fallback';

describe('scheduleWithAttachmentFallback', () => {
  it('retries without attachments when iOS rejects the attachment', async () => {
    const requests: { content: Record<string, unknown> }[] = [];
    const Notifications = {
      scheduleNotificationAsync: async (request: { content: Record<string, unknown> }) => {
        requests.push(request);
        if (requests.length === 1) {
          throw new Error('Invalid attachment file URL');
        }
      },
    };

    await scheduleWithAttachmentFallback(Notifications, {
      content: {
        title: 'Reminder',
        attachments: [{ identifier: 'pet-photo', url: 'file:///photo.jpg' }],
      },
      trigger: { type: 'date' },
    });

    assert.equal(requests.length, 2);
    assert.equal('attachments' in requests[1]!.content, false);
    assert.equal(requests[1]!.content.title, 'Reminder');
  });

  it('preserves scheduling errors when no attachment was supplied', async () => {
    const expectedError = new Error('Invalid trigger');
    const Notifications = {
      scheduleNotificationAsync: async () => {
        throw expectedError;
      },
    };

    await assert.rejects(
      scheduleWithAttachmentFallback(Notifications, {
        content: { title: 'Reminder' },
        trigger: { type: 'date' },
      }),
      expectedError
    );
  });
});
