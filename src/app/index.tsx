import { Link, router, type Href } from 'expo-router';
import {
  Bug,
  ChevronRight,
  History,
  PawPrint,
  Pill,
  Settings,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, IjansButton, Screen, colors, icons, radius, spacing, states, touch } from '@/ui';

const showDevScreens = __DEV__ || process.env.EXPO_PUBLIC_BENCH === '1';

/** E10 — Accueil : un gros bouton « Kòmanse », le bouton rouge Ijans, et les accès rapides. */
export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <Screen
      withHeader={false}
      footer={
        <>
          <Button title={t('common.start')} icon={PawPrint} onPress={() => router.push('/animal')} />
          <IjansButton />
        </>
      }
    >
      <View style={styles.hero}>
        <AppText variant="display">{t('common.appName')}</AppText>
        <AppText>{t('home.tagline')}</AppText>
      </View>

      <View style={styles.list}>
        <QuickLink href="/rage" icon={Bug} label={t('home.rabies')} />
        <QuickLink href="/toxiques" icon={Pill} label={t('home.toxics')} />
        <QuickLink href="/veterinaires" icon={Stethoscope} label={t('home.vets')} />
        <QuickLink href="/istwa" icon={History} label={t('home.history')} />
        <QuickLink href="/reglaj" icon={Settings} label={t('home.settings')} />
      </View>

      {showDevScreens && (
        <View style={styles.dev}>
          <Link href="/dev/bench" style={styles.devLink}>
            Banc d’essai IA (dev)
          </Link>
          <Link href="/dev/catalogue" style={styles.devLink}>
            Catalogue UI (dev)
          </Link>
        </View>
      )}
    </Screen>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: Href; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.row, pressed && { opacity: states.pressed }]}
      >
        <Icon color={colors.primary} size={icons.md} strokeWidth={icons.stroke} />
        <AppText variant="bodyStrong" style={styles.rowLabel}>
          {label}
        </AppText>
        <ChevronRight color={colors.inkMuted} size={icons.md} strokeWidth={icons.stroke} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm, paddingTop: spacing.xl },
  list: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: touch.primary,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { flex: 1 },
  dev: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl },
  devLink: { color: colors.inkMuted, paddingVertical: spacing.md },
});
