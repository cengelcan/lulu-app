import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { Spacing } from '@/constants/theme';

type AuthExpandableEmailSectionProps = {
  children: React.ReactNode;
};

export function AuthExpandableEmailSection({ children }: AuthExpandableEmailSectionProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(380).springify().damping(20).stiffness(160)}
      exiting={FadeOutUp.duration(320).springify().damping(22).stiffness(180)}
      style={styles.container}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
});
