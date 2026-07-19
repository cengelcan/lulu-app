type NotificationRequest = {
  content: Record<string, unknown> & {
    attachments?: unknown[];
  };
  [key: string]: unknown;
};

type NotificationScheduler = {
  scheduleNotificationAsync: (request: NotificationRequest) => Promise<unknown>;
};

export async function scheduleWithAttachmentFallback(
  Notifications: NotificationScheduler,
  request: NotificationRequest
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync(request);
  } catch (error) {
    if (!request.content.attachments?.length) {
      throw error;
    }

    const { attachments: _attachments, ...contentWithoutAttachments } = request.content;

    await Notifications.scheduleNotificationAsync({
      ...request,
      content: contentWithoutAttachments,
    });
  }
}
