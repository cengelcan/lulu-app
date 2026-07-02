import { Linking, Share, StyleSheet } from 'react-native';
import * as StoreReview from 'expo-store-review';

import { ProfileListRow } from '@/components/profile/ProfileListRow';
import { Card } from '@/components/ui/Card';
import { APP_STORE_REVIEW_URL, INSTAGRAM_URL, SHARE_URL } from '@/constants/social';
import { useTranslation } from '@/hooks/use-translation';
import {
  getLastStoreReviewPromptAt,
  setLastStoreReviewPromptAt,
} from '@/storage/user.storage';

const REVIEW_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;

export function CommunityCard() {
  const { t } = useTranslation();

  const openStoreReviewPage = () => {
    void Linking.openURL(APP_STORE_REVIEW_URL);
  };

  const handleRate = async () => {
    // The native in-app prompt is rate-limited by the OS, so we only use it
    // when available and outside our own cooldown. In every other case we send
    // the user to the store listing instead of showing a dead-end.
    const isAvailable = await StoreReview.isAvailableAsync();

    if (!isAvailable) {
      openStoreReviewPage();
      return;
    }

    const lastPromptAt = await getLastStoreReviewPromptAt();
    const now = Date.now();

    if (lastPromptAt !== null && now - lastPromptAt < REVIEW_COOLDOWN_MS) {
      openStoreReviewPage();
      return;
    }

    await StoreReview.requestReview();
    await setLastStoreReviewPromptAt(now);
  };

  const handleShare = async () => {
    await Share.share({
      message: `${t('profile.shareMessage')} ${SHARE_URL}`,
      url: SHARE_URL,
    });
  };

  const handleInstagram = () => {
    void Linking.openURL(INSTAGRAM_URL);
  };

  return (
    <Card style={styles.card}>
      <ProfileListRow
        label={t('profile.rateLulu')}
        icon="star.fill"
        onPress={() => void handleRate()}
      />
      <ProfileListRow
        label={t('profile.shareLulu')}
        icon="square.and.arrow.up"
        onPress={() => void handleShare()}
      />
      <ProfileListRow
        label={t('profile.followInstagram')}
        icon="camera.fill"
        showExternalIcon
        isLast
        onPress={handleInstagram}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
});
