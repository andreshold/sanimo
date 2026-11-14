import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IjansButton } from './ijans-button';
import { colors, spacing } from './theme';

/**
 * Gabarit d'écran : fond Brume, zones sûres (edge-to-edge Android), défilement.
 * - `footer` : actions collées en bas (bouton principal), toujours visibles.
 * - `ijans` : affiche le bouton « Ijans kounye a » en bas (parcours d'évaluation).
 */
export function Screen({
  children,
  footer,
  ijans = false,
  scroll = true,
  withHeader = true,
}: {
  children: ReactNode;
  footer?: ReactNode;
  ijans?: boolean;
  scroll?: boolean;
  /** true quand la barre de navigation est affichée (la zone sûre du haut est alors gérée par elle) */
  withHeader?: boolean;
}) {
  const body = scroll ? (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={withHeader ? ['bottom', 'left', 'right'] : ['top', 'bottom', 'left', 'right']}>
      {body}
      {(footer || ijans) && (
        <View style={styles.footer}>
          {footer}
          {ijans && <IjansButton size="md" />}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.xl, gap: spacing.lg, flexGrow: 1 },
  fill: { flex: 1 },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
