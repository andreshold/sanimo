import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './app-text';
import { colors, icons, radius, spacing, states, touch } from './theme';

/** Ligne à cocher (symptômes détectés, E22). `alert` signale un signe d'alerte (point rouge, jamais la couleur seule). */
export function CheckRow({
  label,
  hint,
  checked,
  alert = false,
  alertLabel,
  onToggle,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  alert?: boolean;
  /** Texte lu par TalkBack pour un signe d'alerte (ex. « Siy ijans ») */
  alertLabel?: string;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={[label, alert ? alertLabel : null, hint].filter(Boolean).join(', ')}
      onPress={() => {
        Haptics.selectionAsync();
        onToggle();
      }}
      style={({ pressed }) => [styles.row, checked && styles.rowChecked, pressed && { opacity: states.pressed }]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Check color={colors.white} size={icons.sm} strokeWidth={2.5} />}
      </View>
      <View style={styles.text}>
        <AppText variant="bodyStrong">{label}</AppText>
        {hint && <AppText variant="small">{hint}</AppText>}
      </View>
      {alert && <View style={styles.alertDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: touch.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowChecked: { borderColor: colors.care, backgroundColor: colors.careBg },
  box: {
    width: icons.lg,
    height: icons.lg,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.care, borderColor: colors.care },
  text: { flex: 1, gap: 2 },
  alertDot: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.danger },
});
