import { Linking, Share, StyleSheet } from 'react-native';
import * as StoreReview from 'expo-store-review';

import { ProfileListRow } from '@/components/profile/ProfileListRow';
import { Card } from '@/components/ui/Card';
import {
  APP_STORE_REVIEW_DEEP_LINK,
  APP_STORE_REVIEW_URL,
  INSTAGRAM_URL,
  SHARE_URL,
} from '@/constants/social';
import { useTranslation } from '@/hooks/use-translation';

async function openAppStoreReviewPage(): Promise<void> {
  for (const url of [APP_STORE_REVIEW_URL, APP_STORE_REVIEW_DEEP_LINK]) {
    try {
      await Linking.openURL(url);
      return;
    } catch {
      // Try the next URL scheme.
    }
  }
}

export function CommunityCard() {
  const { t } = useTranslation();

  const handleRate = async () => {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
      return;
    }

    await openAppStoreReviewPage();
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
