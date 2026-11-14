import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './app-text';
import { colors, icons, radius, shadows, spacing, states, touch } from './theme';

/** Grande carte de choix unique (langue, chien/chat, âge…). Cible tactile généreuse. */
export function ChoiceCard({
  title,
  subtitle,
  icon: Icon,
  selected = false,
  onPress,
  style,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  selected?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && { opacity: states.pressed },
        style,
      ]}
    >
      {Icon && (
        <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
          <Icon color={selected ? colors.white : colors.primary} size={icons.lg} strokeWidth={icons.stroke} />
        </View>
      )}
      <View style={styles.text}>
        <AppText variant="h3">{title}</AppText>
        {subtitle && <AppText variant="small">{subtitle}</AppText>}
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioDot} />}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: touch.primary + spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: colors.border,
    boxShadow: shadows.card,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  iconWrap: {
    width: touch.min,
    height: touch.min,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  iconWrapSelected: { backgroundColor: colors.primary },
  text: { flex: 1, gap: spacing.xs },
  radio: {
    width: icons.md,
    height: icons.md,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: icons.md / 2, height: icons.md / 2, borderRadius: radius.pill, backgroundColor: colors.primary },
});
