export type SubscriptionRestoreOrigin = 'user_action' | 'session_initialization';

/**
 * Restoring a StoreKit receipt can transfer purchases between RevenueCat users.
 * Require an explicit user action so signing into a different Lulu account never
 * silently claims the Apple account's existing subscription.
 */
export function assertUserInitiatedSubscriptionRestore(
  origin: SubscriptionRestoreOrigin
): void {
  if (origin !== 'user_action') {
    throw new Error('subscription_restore_requires_user_action');
  }
}
