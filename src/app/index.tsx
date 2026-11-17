import { Link, router, useFocusEffect, type Href } from 'expo-router';
import type { TFunction } from 'i18next';
import {
  Bug,
  ChevronRight,
  Download,
  History,
  PawPrint,
  Pill,
  RotateCcw,
  Settings,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { getAssessmentSession, resumeRoute } from '@/session';
import { getDb } from '@/storage/app-db';
import type { Assessment } from '@/storage/assessments';
import { isAiPackReady } from '@/storage/models';
import { AppText, Banner, Button, Card, IjansButton, Screen, colors, icons, radius, spacing, states, touch } from '@/ui';

function timeAgo(t: TFunction, ts: number): string {
  const minutes = Math.max(1, Math.round((Date.now() - ts) / 60000));
  return minutes < 60 ? t('home.minutesAgo', { count: minutes }) : t('home.hoursAgo', { count: Math.round(minutes / 60) });
}

const showDevScreens = __DEV__ || process.env.EXPO_PUBLIC_BENCH === '1';

/** E10 — Accueil : un gros bouton « Kòmanse », le bouton rouge Ijans, la reprise et les accès rapides. */
export default function HomeScreen() {
  const { t } = useTranslation();
  const [resumable, setResumable] = useState<Assessment | null>(null);
  const [aiReady, setAiReady] = useState(true);

  // Relu à chaque retour sur l'accueil : une évaluation peut avoir été interrompue, le pack téléchargé…
  useFocusEffect(
    useCallback(() => {
      setResumable(getAssessmentSession().findResumable());
      setAiReady(isAiPackReady(getDb()));
    }, []),
  );

  const startNew = () => {
    getAssessmentSession().start('ht');
    router.push('/animal');
  };

  const resume = (a: Assessment) => {
    const resumed = getAssessmentSession().resume(a.id);
    if (resumed) router.push(resumeRoute(resumed));
  };

  return (
    <Screen
      withHeader={false}
      footer={
        <>
          <Button title={t('common.start')} icon={PawPrint} onPress={startNew} />
          <IjansButton />
        </>
      }
    >
      <View style={styles.hero}>
        <AppText variant="display">{t('common.appName')}</AppText>
        <AppText>{t('home.tagline')}</AppText>
      </View>

      {!aiReady && (
        <View style={styles.aiPack}>
          <Banner tone="offline">{t('home.aiPackMissing')}</Banner>
          <Button title={t('home.aiPackAction')} variant="secondary" size="md" icon={Download} onPress={() => router.push('/pack-ia')} />
        </View>
      )}

      {resumable && (
        <Card>
          <AppText variant="h3">{t('home.resumeTitle')}</AppText>
          <AppText variant="small">{t('home.resumeBody', { when: timeAgo(t, resumable.updatedAt) })}</AppText>
          <View style={styles.resumeActions}>
            <Button title={t('home.resume')} variant="confirm" size="md" icon={RotateCcw} onPress={() => resume(resumable)} />
            <Button title={t('home.restart')} variant="secondary" size="md" onPress={startNew} />
          </View>
        </Card>
      )}

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

/** Ligne de navigation. Pressable + router.push : `Link asChild` ne transmet pas le style-fonction du Pressable. */
function QuickLink({ href, icon: Icon, label }: { href: Href; icon: LucideIcon; label: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.row, pressed && { opacity: states.pressed }]}
    >
      <Icon color={colors.primary} size={icons.md} strokeWidth={icons.stroke} />
      <AppText variant="bodyStrong" style={styles.rowLabel}>
        {label}
      </AppText>
      <ChevronRight color={colors.inkMuted} size={icons.md} strokeWidth={icons.stroke} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm, paddingTop: spacing.xl },
  resumeActions: { gap: spacing.sm, paddingTop: spacing.sm },
  aiPack: { gap: spacing.sm },
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
