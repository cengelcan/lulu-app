import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

import { ProfileListRow } from '@/components/profile/ProfileListRow';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/legal';
import { useTranslation } from '@/hooks/use-translation';
import {
  deleteAllLocalData,
  resetAppStoresAfterDataDeletion,
} from '@/services/cleanup/delete-all-local-data';
import { useUserStore } from '@/stores/user.store';

async function openLegalUrl(url: string): Promise<void> {
  await openBrowserAsync(url, {
    presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
  });
}

export function LegalCard() {
  const router = useRouter();
  const { t } = useTranslation();
  const provider = useUserStore((state) => state.provider);
  const signOut = useUserStore((state) => state.signOut);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const showLogOut = provider !== 'guest';

  const handleLogOut = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await signOut();
      router.replace('/');
    } catch {
      setIsLoggingOut(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteAllLocalData();
      resetAppStoresAfterDataDeletion();
      setDeleteModalVisible(false);
      router.replace('/');
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card style={styles.card}>
        <ProfileListRow
          label={t('profile.privacyPolicy')}
          showChevron={false}
          showExternalIcon
          onPress={() => void openLegalUrl(PRIVACY_POLICY_URL)}
        />
        <ProfileListRow
          label={t('profile.terms')}
          showChevron={false}
          showExternalIcon
          onPress={() => void openLegalUrl(TERMS_URL)}
        />
        <ProfileListRow
          label={t('profile.deleteAccount')}
          destructive
          showChevron={false}
          isLast={!showLogOut}
          onPress={() => setDeleteModalVisible(true)}
        />
        {showLogOut ? (
          <ProfileListRow
            label={t('profile.logOut')}
            destructive
            showChevron={false}
            isLast
            onPress={() => void handleLogOut()}
          />
        ) : null}
      </Card>

      <ConfirmModal
        visible={deleteModalVisible}
        title={t('profile.deleteAccountTitle')}
        message={t('profile.deleteAccountMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        isLoading={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteModalVisible(false);
          }
        }}
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
