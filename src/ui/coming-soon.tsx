import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText } from './app-text';
import { Button } from './button';
import { Card } from './card';
import { ProgressSteps } from './progress-steps';
import { Screen } from './screen';

/**
 * Écran provisoire (étape 4) : titre, mention « bientôt », bouton suivant.
 * Remplacé écran par écran aux étapes 6 à 14.
 */
export function ComingSoon({
  title,
  code,
  next,
  step,
  ijans = false,
}: {
  title: string;
  /** Code de l'écran dans l'App flow (E20, E30…) */
  code: string;
  next?: Href;
  step?: { current: number; total: number };
  ijans?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Screen
      ijans={ijans}
      footer={next ? <Button title={t('common.next')} onPress={() => router.push(next)} /> : undefined}
    >
      {step && <ProgressSteps current={step.current} total={step.total} />}
      <AppText variant="h1">{title}</AppText>
      <Card>
        <AppText variant="caption">{code}</AppText>
        <AppText>{t('common.comingSoon')}</AppText>
      </Card>
    </Screen>
  );
}
