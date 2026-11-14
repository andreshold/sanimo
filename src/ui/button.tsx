import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './app-text';
import { colors, icons, radius, spacing, states, touch } from './theme';

/**
 * primary : action principale (bleu) · confirm : confirmer (émeraude)
 * secondary : action secondaire (contour) · danger : urgence uniquement (rouge)
 */
const variants = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  confirm: { bg: colors.care, fg: colors.white, border: colors.care },
  secondary: { bg: colors.white, fg: colors.primary, border: colors.border },
  danger: { bg: colors.danger, fg: colors.white, border: colors.danger },
} as const;

const sizes = {
  md: { minHeight: touch.min, paddingHorizontal: spacing.lg, text: 'buttonSmall', icon: icons.sm },
  lg: { minHeight: touch.primary, paddingHorizontal: spacing.xl, text: 'button', icon: icons.md },
} as const;

export type ButtonVariant = keyof typeof variants;

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  loading = false,
  disabled = false,
  accessibilityHint,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const v = variants[variant];
  const s = sizes[size];
  const inactive = disabled || loading;

  const handlePress = () => {
    Haptics.impactAsync(variant === 'danger' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        { minHeight: s.minHeight, paddingHorizontal: s.paddingHorizontal, backgroundColor: v.bg, borderColor: v.border },
        pressed && { opacity: states.pressed },
        disabled && { opacity: states.disabled },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.content}>
          {Icon && <Icon color={v.fg} size={s.icon} strokeWidth={icons.stroke} />}
          <AppText variant={s.text} style={[styles.label, { color: v.fg }]}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { textAlign: 'center', flexShrink: 1 },
});
