import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from './app-text';
import { colors, radius, spacing } from './theme';

/** Avancement dans le parcours d'évaluation (« Etap 2 sou 5 »). */
export function ProgressSteps({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation();
  const label = t('common.stepOf', { current, total });
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: total, now: current }}
      style={styles.wrap}
    >
      <View style={styles.bars}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.bar, i < current && styles.barDone]} />
        ))}
      </View>
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  bars: { flexDirection: 'row', gap: spacing.xs },
  bar: { flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: colors.border },
  barDone: { backgroundColor: colors.primary },
});
