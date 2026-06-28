import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type BreedSearchFieldProps = {
  breed: string | null;
  breedOptions: { value: string; label: string }[];
  placeholder: string;
  noResultsLabel: string;
  accessibilityLabel: string;
  onBreedChange: (breed: string | null) => void;
};

const RESULTS_MAX_HEIGHT = 220;
const FIELD_ICON_SIZE = 18;

function normalizeForSearch(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function BreedSearchField({
  breed,
  breedOptions,
  placeholder,
  noResultsLabel,
  accessibilityLabel,
  onBreedChange,
}: BreedSearchFieldProps) {
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const borderSoftColor = useThemeColor({}, 'borderSoft');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const brandAccentBorder = useThemeColor({}, 'brandAccentBorder');
  const brandAccentGlow = useThemeColor({}, 'brandAccentGlow');
  const primaryTextColor = useThemeColor({}, 'primaryText');

  const selectedLabel = useMemo(
    () => breedOptions.find((option) => option.value === breed)?.label ?? '',
    [breed, breedOptions]
  );

  useEffect(() => {
    if (!focused) {
      setQuery(selectedLabel);
    }
  }, [focused, selectedLabel]);

  const filteredOptions = useMemo(() => {
    const search = normalizeForSearch(focused ? query : selectedLabel);
    if (!search) {
      return breedOptions;
    }

    return breedOptions.filter((option) => normalizeForSearch(option.label).includes(search));
  }, [breedOptions, focused, query, selectedLabel]);

  const showResults = focused;
  const isActive = focused || Boolean(breed);

  const handleFocus = () => {
    setFocused(true);
    setQuery(selectedLabel);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setFocused(false);
      setQuery(selectedLabel);
    }, 150);
  };

  const handleChangeText = (text: string) => {
    setQuery(text);

    if (!text.trim()) {
      onBreedChange(null);
      return;
    }

    if (breed && text !== selectedLabel) {
      onBreedChange(null);
    }
  };

  const handleClear = () => {
    onBreedChange(null);
    setQuery('');
    inputRef.current?.focus();
  };

  const handleSelect = (value: string, label: string) => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onBreedChange(value);
    setQuery(label);
    setFocused(false);
    inputRef.current?.blur();
  };

  return (
    <View
      style={[
        styles.combobox,
        {
          backgroundColor: surfaceColor,
          borderColor: isActive ? brandAccentColor : borderColor,
          borderWidth: isActive ? 1.5 : StyleSheet.hairlineWidth,
        },
        showResults
          ? Platform.select({
              ios: {
                shadowColor: brandAccentGlow,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 14,
              },
              android: { elevation: 4 },
              default: {},
            })
          : null,
      ]}>
      <View style={styles.inputRow}>
        <View style={[styles.iconWrap, { backgroundColor: brandAccentSoft }]}>
          <IconSymbol name="magnifyingglass" size={FIELD_ICON_SIZE} color={brandAccentColor} />
        </View>

        <TextInput
          ref={inputRef}
          accessibilityLabel={accessibilityLabel}
          autoCapitalize="words"
          autoCorrect={false}
          placeholder={placeholder}
          placeholderTextColor={textSecondaryColor}
          returnKeyType="done"
          style={[styles.input, { color: textColor }]}
          value={query}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
        />

        {breed && !focused ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear breed"
            hitSlop={8}
            onPress={handleClear}
            style={({ pressed }) => [styles.trailingAction, { opacity: pressed ? 0.65 : 1 }]}>
            <IconSymbol name="xmark.circle" size={20} color={textSecondaryColor} />
          </Pressable>
        ) : showResults ? (
          <View style={styles.trailingAction}>
            <IconSymbol name="chevron.down" size={18} color={brandAccentColor} />
          </View>
        ) : null}
      </View>

      {showResults ? (
        <>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {filteredOptions.length > 0 ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={styles.resultsScroll}
              contentContainerStyle={styles.resultsContent}>
              {filteredOptions.map((option, index) => {
                const selected = breed === option.value;
                const isLast = index === filteredOptions.length - 1;

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => handleSelect(option.value, option.label)}
                    style={({ pressed }) => [
                      styles.resultItem,
                      !isLast && {
                        borderBottomColor: borderSoftColor,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      },
                      selected
                        ? { backgroundColor: brandAccentSoft }
                        : pressed
                          ? { backgroundColor: brandAccentSoft }
                          : null,
                    ]}>
                    <ThemedText
                      type="defaultSemiBold"
                      lightColor={selected ? brandAccentColor : textColor}
                      darkColor={selected ? brandAccentColor : textColor}
                      style={styles.resultLabel}>
                      {option.label}
                    </ThemedText>

                    {selected ? (
                      <View
                        style={[
                          styles.checkBadge,
                          { backgroundColor: brandAccentColor, borderColor: brandAccentBorder },
                        ]}>
                        <ThemedText
                          lightColor={primaryTextColor}
                          darkColor={primaryTextColor}
                          style={styles.checkmark}>
                          ✓
                        </ThemedText>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.noResultsWrap}>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.noResults}>
                {noResultsLabel}
              </ThemedText>
            </View>
          )}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  combobox: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    ...Typography.body,
    flex: 1,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.xs,
  },
  trailingAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.sm,
  },
  resultsScroll: {
    maxHeight: RESULTS_MAX_HEIGHT,
  },
  resultsContent: {
    paddingBottom: Spacing.xs,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  resultLabel: {
    flex: 1,
    ...Typography.bodySemiBold,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  checkmark: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  noResultsWrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  noResults: {
    ...Typography.body,
    textAlign: 'center',
  },
});
