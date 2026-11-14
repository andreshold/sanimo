import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { setLanguage } from '@/i18n';
import { useSettings } from '@/storage/settings';
import { AppText, Card, ChoiceCard, Screen, spacing } from '@/ui';

/**
 * E80 — Réglages. Pour l'instant : la langue (utile pour tester l'i18n).
 * Lecture automatique, voix, pack IA, « Efase done mwen yo », sources et licences : étape 14.
 */
export default function SettingsScreen() {
  const { t } = useTranslation();
  const { lang } = useSettings();

  return (
    <Screen>
      <View accessibilityRole="radiogroup" style={styles.group}>
        <AppText variant="h3">{t('onboarding.languageTitle')}</AppText>
        <ChoiceCard title={t('onboarding.langHt')} selected={lang === 'ht'} onPress={() => setLanguage('ht')} />
        <ChoiceCard title={t('onboarding.langFr')} selected={lang === 'fr'} onPress={() => setLanguage('fr')} />
      </View>
      <Card>
        <AppText variant="caption">E80</AppText>
        <AppText>{t('common.comingSoon')}</AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.md },
});
