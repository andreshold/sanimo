import { Square, Volume2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from './app-text';
import { colors, icons, radius, spacing, states, touch } from './theme';

/**
 * Bouton 🔊 « Koute » : lit le clip de l'écran. Le lecteur audio arrive à l'étape 12 ;
 * pour l'instant le parent gère `playing` et `onPress`.
 */
export function ListenButton({ playing = false, onPress }: { playing?: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const label = playing ? t('common.stop') : t('common.listen');
  const Icon = playing ? Square : Volume2;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={spacing.sm}
      style={({ pressed }) => [styles.btn, playing && styles.playing, pressed && { opacity: states.pressed }]}
    >
      <Icon color={playing ? colors.white : colors.primary} size={icons.md} strokeWidth={icons.stroke} />
      <AppText variant="buttonSmall" style={{ color: playing ? colors.white : colors.primary }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    minHeight: touch.min,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryTint,
  },
  playing: { backgroundColor: colors.primary },
});
