import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { LuluPlusPaywallContent } from '@/components/paywall/LuluPlusPaywall';

export default function PaywallScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <LuluPlusPaywallContent
        onDismiss={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace('/(tabs)/home');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
