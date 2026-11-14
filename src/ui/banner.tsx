import { Info, TriangleAlert, WifiOff, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from './app-text';
import { colors, icons, radius, spacing } from './theme';

/**
 * Bandeau discret d'information. Volontairement sans rouge : le rouge est réservé à l'urgence.
 * info : information neutre · offline : hors ligne / pack IA absent · warning : attention (ambre, texte Encre)
 */
const tones: Record<'info' | 'offline' | 'warning', { bg: string; border: string; icon: LucideIcon }> = {
  info: { bg: colors.primaryTint, border: colors.primaryTint, icon: Info },
  offline: { bg: colors.white, border: colors.border, icon: WifiOff },
  warning: { bg: colors.accentBg, border: colors.accent, icon: TriangleAlert },
};

export function Banner({ tone = 'info', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  const t = tones[tone];
  const Icon = t.icon;
  return (
    <View accessible accessibilityRole="text" style={[styles.wrap, { backgroundColor: t.bg, borderColor: t.border }]}>
      <Icon color={colors.ink} size={icons.md} strokeWidth={icons.stroke} />
      <AppText variant="small" style={styles.text}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  text: { flex: 1, color: colors.ink },
});
