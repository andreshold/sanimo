import { router } from 'expo-router';
import { Download } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { getSettings, updateSettings } from '@/storage/settings';
import { AppText, Banner, Button, Card, Screen, colors, icons, spacing } from '@/ui';

/**
 * E03 — Pack IA. Le téléchargement réel arrive à l'étape 11.
 * Première ouverture : « Kontinye san IA » termine l'onboarding et ouvre l'accueil.
 * Ensuite (depuis le bandeau de l'accueil) : simple retour.
 */
export default function AiPackScreen() {
  const { t } = useTranslation();
  const finish = () => {
    if (!getSettings().aiPackPromptSeen) {
      updateSettings({ aiPackPromptSeen: true });
      router.replace('/');
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

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
