import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from './theme';

/** Surface blanche sur fond Brume. Contenu libre (composition plutôt que props de contenu). */
export function Card({ style, ...props }: ViewProps & { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    boxShadow: shadows.card,
  },
});
