import { router } from 'expo-router';
import { Languages } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { setLanguage } from '@/i18n';
import { useSettings } from '@/storage/settings';
import { AppText, Button, ChoiceCard, Screen, colors, icons, spacing } from '@/ui';

/** E01 — Choix de la langue. Kreyòl présélectionné ; le changement s'applique tout de suite. */
export default function LanguageScreen() {
  const { t } = useTranslation();
  const { lang } = useSettings();
  const selected = lang ?? 'ht';

  return (
    <Screen
      withHeader={false}
      footer={
        <Button
          title={t('common.next')}
          onPress={() => {
            setLanguage(selected);
            router.push('/avertissement');
          }}
        />
      }
    >
      <View style={styles.hero}>
        <Languages color={colors.primary} size={icons.xl} strokeWidth={icons.stroke} />
        <AppText variant="display">{t('common.appName')}</AppText>
        <AppText variant="h2">{t('onboarding.languageTitle')}</AppText>
        <AppText variant="small">{t('onboarding.languageSubtitle')}</AppText>
      </View>
      <View accessibilityRole="radiogroup" style={styles.choices}>
        <ChoiceCard title={t('onboarding.langHt')} selected={selected === 'ht'} onPress={() => setLanguage('ht')} />
        <ChoiceCard title={t('onboarding.langFr')} selected={selected === 'fr'} onPress={() => setLanguage('fr')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'flex-end', gap: spacing.sm, paddingTop: spacing.xxl },
  choices: { gap: spacing.md },
});
