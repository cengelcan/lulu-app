import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { DISPLAY_NAME_MAX_LENGTH } from '@/types/user';

type EditNameModalProps = {
  visible: boolean;
  initialValue: string;
  isSaving?: boolean;
  onSave: (value: string) => void;
  onCancel: () => void;
};

export function EditNameModal({
  visible,
  initialValue,
  isSaving = false,
  onSave,
  onCancel,
}: EditNameModalProps) {
  const [value, setValue] = useState(initialValue);

  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
    }
  }, [visible, initialValue]);

  const handleSave = () => {
    onSave(value);
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <Pressable
        accessibilityLabel="Dismiss dialog"
        accessibilityRole="button"
        style={styles.backdrop}
        onPress={onCancel}>
        <Pressable
          style={[styles.card, { backgroundColor: surfaceColor }]}
          onPress={(event) => event.stopPropagation()}>
          <ThemedText type="subtitle" style={styles.title}>
            Your Name
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.message}>
            This name is optional and only shown on your profile.
          </ThemedText>
          <TextInput
            accessibilityLabel="Display name"
            autoCapitalize="words"
            autoCorrect={false}
            editable={!isSaving}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            placeholder="Your name"
            placeholderTextColor={textSecondaryColor}
            returnKeyType="done"
            style={[
              styles.input,
              {
                color: textColor,
                backgroundColor: surfaceColor,
                borderColor,
              },
            ]}
            value={value}
            onChangeText={setValue}
            onSubmitEditing={handleSave}
          />
          <View style={styles.actions}>
            <Button
              accessibilityLabel="Cancel"
              title="Cancel"
              variant="secondary"
              disabled={isSaving}
              onPress={onCancel}
              style={styles.actionButton}
            />
            <Button
              accessibilityLabel="Save name"
              title="Save"
              disabled={isSaving}
              onPress={handleSave}
              style={styles.actionButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  input: {
    ...Typography.body,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});
