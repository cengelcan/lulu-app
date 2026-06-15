import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

import { ProfileListRow } from '@/components/profile/ProfileListRow';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/legal';
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
  const provider = useUserStore((state) => state.provider);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showLogOut = provider !== 'guest';

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
          label="Privacy Policy"
          showChevron={false}
          showExternalIcon
          onPress={() => void openLegalUrl(PRIVACY_POLICY_URL)}
        />
        <ProfileListRow
          label="Terms & Conditions"
          showChevron={false}
          showExternalIcon
          onPress={() => void openLegalUrl(TERMS_URL)}
        />
        <ProfileListRow
          label="Delete My Account"
          destructive
          showChevron={false}
          isLast={!showLogOut}
          onPress={() => setDeleteModalVisible(true)}
        />
        {showLogOut ? (
          <ProfileListRow
            label="Log Out"
            destructive
            showChevron={false}
            isLast
            onPress={() => {
              // Auth integration will handle sign-out.
            }}
          />
        ) : null}
      </Card>

      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete My Account?"
        message="All pets, check-ins, and preferences on this device will be permanently removed."
        confirmLabel="Delete"
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
