import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from './app-text';
import { colors, radius, spacing, touch, typography } from './theme';

/** Champ de saisie de la charte : grand, lisible, bordure bleue quand il est actif. */
export function TextField({
  label,
  multiline = false,
  style,
  onFocus,
  onBlur,
  ...props
}: TextInputProps & { label?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label && <AppText variant="bodyStrong">{label}</AppText>}
      <TextInput
        accessibilityLabel={label ?? props.placeholder}
        placeholderTextColor={colors.inkMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, multiline && styles.multiline, focused && styles.focused, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  input: {
    ...typography.body,
    minHeight: touch.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  multiline: { minHeight: 160 },
  focused: { borderColor: colors.primary },
});
