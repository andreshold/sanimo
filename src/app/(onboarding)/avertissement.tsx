import { router } from 'expo-router';
import { ShieldAlert } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { updateSettings } from '@/storage/settings';
import { AppText, Banner, Button, Card, ListenButton, Screen, colors, icons, spacing } from '@/ui';

/** E02 — Avertissement « Sanimo pa ranplase yon veterinè », lu à voix haute (lecteur : étape 12), accepté une fois. */
export default function DisclaimerScreen() {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);

  return (
    <Screen
      footer={
        <Button
          title={t('onboarding.disclaimerAccept')}
          variant="confirm"
          onPress={() => {
            updateSettings({ disclaimerAccepted: true });
            router.push('/pack-ia');
          }}
        />
      }
    >
      <View style={styles.head}>
        <ShieldAlert color={colors.primary} size={icons.xl} strokeWidth={icons.stroke} />
        <AppText variant="h1">{t('onboarding.disclaimerTitle')}</AppText>
      </View>
      <ListenButton playing={playing} onPress={() => setPlaying((p) => !p)} />
      <Card>
        <AppText variant="bodyStrong">{t('common.disclaimerShort')}</AppText>
        <AppText>{t('onboarding.disclaimerBody')}</AppText>
      </Card>
      <Banner tone="info">{t('onboarding.disclaimerEmergency')}</Banner>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: spacing.md },
});
