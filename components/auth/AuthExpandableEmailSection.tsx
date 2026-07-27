import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, ReduceMotion } from 'react-native-reanimated';

import { Spacing } from '@/constants/theme';

type AuthExpandableEmailSectionProps = {
  children: React.ReactNode;
};

export function AuthExpandableEmailSection({ children }: AuthExpandableEmailSectionProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(260)
        .springify()
        .damping(20)
        .stiffness(160)
        .reduceMotion(ReduceMotion.System)}
      exiting={FadeOutUp.duration(220)
        .springify()
        .damping(22)
        .stiffness(180)
        .reduceMotion(ReduceMotion.System)}
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
