import { useState } from 'react';
import { Linking, Share, StyleSheet } from 'react-native';
import * as StoreReview from 'expo-store-review';

import { ProfileListRow } from '@/components/profile/ProfileListRow';
import { Card } from '@/components/ui/Card';
import { ComingSoonModal } from '@/components/ui/ComingSoonModal';
import { INSTAGRAM_URL, SHARE_MESSAGE, SHARE_URL } from '@/constants/social';
import {
  getLastStoreReviewPromptAt,
  setLastStoreReviewPromptAt,
} from '@/storage/user.storage';

const REVIEW_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;

export function CommunityCard() {
  const [isComingSoonVisible, setIsComingSoonVisible] = useState(false);

  const handleRate = async () => {
    const isAvailable = await StoreReview.isAvailableAsync();

    if (!isAvailable) {
      setIsComingSoonVisible(true);
      return;
    }

    const lastPromptAt = await getLastStoreReviewPromptAt();
    const now = Date.now();

    if (lastPromptAt !== null && now - lastPromptAt < REVIEW_COOLDOWN_MS) {
      setIsComingSoonVisible(true);
      return;
    }

    await StoreReview.requestReview();
    await setLastStoreReviewPromptAt(now);
  };

  const handleShare = async () => {
    await Share.share({
      message: `${SHARE_MESSAGE} ${SHARE_URL}`,
      url: SHARE_URL,
    });
  };

  const handleInstagram = () => {
    void Linking.openURL(INSTAGRAM_URL);
  };

  return (
    <>
      <Card style={styles.card}>
        <ProfileListRow
          label="Rate Lulu"
          icon="star.fill"
          onPress={() => void handleRate()}
        />
        <ProfileListRow
          label="Share Lulu"
          icon="square.and.arrow.up"
          onPress={() => void handleShare()}
        />
        <ProfileListRow
          label="Follow us on Instagram"
          icon="camera.fill"
          showExternalIcon
          isLast
          onPress={handleInstagram}
        />
      </Card>

      <ComingSoonModal
        visible={isComingSoonVisible}
        onDismiss={() => setIsComingSoonVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
});
