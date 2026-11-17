import { useTranslation } from 'react-i18next';
import { AppText, Card, Screen } from '@/ui';

/**
 * E80 — Réglages. Pas de choix de langue : l'application est entièrement en créole.
 * Lecture automatique, voix, pack IA, « Efase done mwen yo », sources et licences : étape 14.
 */
export default function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <Card>
        <AppText variant="caption">E80</AppText>
        <AppText>{t('common.comingSoon')}</AppText>
      </Card>
    </Screen>
  );
}
