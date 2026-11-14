import { Download } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { updateSettings } from '@/storage/settings';
import { AppText, Banner, Button, Card, Screen, colors, icons, spacing } from '@/ui';

/**
 * E03 — Pack IA. Le téléchargement réel arrive à l'étape 11.
 * « Kontinye san IA » termine l'onboarding : la garde de navigation renvoie alors vers l'accueil.
 */
export default function AiPackScreen() {
  const { t } = useTranslation();
  const finish = () => updateSettings({ aiPackPromptSeen: true });

  return (
    <Screen
      footer={
        <>
          <Button title={t('common.start')} icon={Download} disabled accessibilityHint={t('common.comingSoon')} />
          <Button title={t('onboarding.aiPackSkip')} variant="secondary" onPress={finish} />
        </>
      }
    >
      <View style={styles.head}>
        <Download color={colors.primary} size={icons.xl} strokeWidth={icons.stroke} />
        <AppText variant="h1">{t('onboarding.aiPackTitle')}</AppText>
      </View>
      <Card>
        <AppText>{t('onboarding.aiPackBody')}</AppText>
      </Card>
      <Banner tone="offline">{t('common.comingSoon')}</Banner>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: spacing.md },
});
