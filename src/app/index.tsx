import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, radius, spacing, touch, typography } from '@/ui/theme';

/** E10 Accueil — version provisoire (étape 1). Les vrais écrans arrivent aux étapes 3 à 6. */
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <Text style={styles.logo}>Sanimo</Text>
        <Text style={styles.tagline}>Asistan veterinè pou bèt ou, menm san entènèt.</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
        >
          <Text style={[typography.button, styles.onDark]}>Kòmanse</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.danger, pressed && styles.pressed]}
        >
          <Text style={[typography.button, styles.onDark]}>Ijans kounye a</Text>
        </Pressable>
        {__DEV__ && (
          <Link href="/dev/bench" style={styles.devLink}>
            Banc d’essai IA (dev)
          </Link>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface, padding: spacing.xl },
  hero: { flex: 1, justifyContent: 'center', gap: spacing.md },
  logo: { ...typography.h1, fontFamily: fonts.logo, fontSize: 44, lineHeight: 52 },
  tagline: typography.body,
  actions: { gap: spacing.md },
  button: {
    minHeight: touch.primary,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  pressed: { opacity: 0.85 },
  onDark: { color: colors.white },
  devLink: { ...typography.small, textAlign: 'center', paddingVertical: spacing.md },
});
