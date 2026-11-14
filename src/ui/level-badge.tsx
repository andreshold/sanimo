import { Eye, Siren, Stethoscope, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import type { Level } from '@/triage/types';

import { AppText } from './app-text';
import { colors, icons, levelColors, radius, spacing } from './theme';

const levelIcons: Record<Level, LucideIcon> = { ijans: Siren, konsilte: Stethoscope, siveye: Eye };

/**
 * Niveau d'urgence : toujours couleur + icône + mot (jamais la couleur seule).
 * `sm` : pastille pour les listes (historique) · `lg` : bandeau du résultat (E30).
 */
export function LevelBadge({ level, size = 'sm' }: { level: Level; size?: 'sm' | 'lg' }) {
  const { t } = useTranslation();
  const c = levelColors[level];
  const Icon = levelIcons[level];
  const label = t(`level.${level}.name`);

  if (size === 'sm') {
    return (
      <View
        accessible
        accessibilityLabel={label}
        style={[styles.pill, { backgroundColor: c.bg, borderColor: c.fg }]}
      >
        <Icon color={level === 'konsilte' ? colors.ink : c.fg} size={icons.sm} strokeWidth={icons.stroke} />
        <AppText variant="caption" style={{ color: level === 'konsilte' ? colors.ink : c.fg }}>
          {label}
        </AppText>
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={`${label}. ${t(`level.${level}.meaning`)}`}
      style={[styles.banner, { backgroundColor: c.fg }]}
    >
      <Icon color={c.onFg} size={icons.xl} strokeWidth={icons.stroke} />
      <View style={styles.bannerText}>
        <AppText variant="h1" style={{ color: c.onFg }}>
          {label}
        </AppText>
        <AppText variant="bodyStrong" style={{ color: c.onFg }}>
          {t(`level.${level}.meaning`)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  bannerText: { flex: 1, gap: spacing.xs },
});
