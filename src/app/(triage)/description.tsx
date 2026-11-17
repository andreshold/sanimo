import { router } from 'expo-router';
import { Mic } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, StyleSheet } from 'react-native';

import { getAssessmentSession, useAssessment } from '@/session';
import { AppText, Button, ProgressSteps, Screen, TextField } from '@/ui';

const MAX_LENGTH = 600;

/**
 * E21 — Description. Pour l'instant au clavier ; le micro (Oswald) arrive aux étapes 10 et 13.
 * Le texte est enregistré à la sortie du champ et au passage à l'écran suivant.
 * Un texte vide est permis : E22 l'annonce et le moteur pose toutes les questions d'alerte.
 */
export default function DescriptionScreen() {
  const { t } = useTranslation();
  const assessment = useAssessment();
  const [text, setText] = useState(assessment?.transcript ?? '');

  // Sans animal décrit, on revient à E20 (lien direct, reprise incomplète)
  useEffect(() => {
    if (!assessment?.species || !assessment?.age) router.replace('/animal');
  }, [assessment?.species, assessment?.age]);

  const save = () => {
    if (!getAssessmentSession().getCurrent()) return;
    const trimmed = text.trim();
    if (trimmed !== (assessment?.transcript ?? '')) {
      // Le texte a changé : les symptômes déjà cochés ne correspondent plus, on les redétectera sur E22
      getAssessmentSession().update({ transcript: trimmed, inputMode: 'text', symptoms: [] });
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.fill}>
      <Screen
        ijans
        footer={
          <Button
            title={t('common.next')}
            onPress={() => {
              save();
              router.push('/symptomes');
            }}
          />
        }
      >
        <ProgressSteps current={2} total={5} />
        <AppText variant="h1">{t('triage.descriptionTitle')}</AppText>
        <AppText variant="small">{t('triage.descriptionHint')}</AppText>

        <Button title={t('triage.micSoon')} icon={Mic} variant="secondary" disabled />

        <TextField
          label={t('triage.descriptionLabel')}
          placeholder={t('triage.descriptionPlaceholder')}
          value={text}
          onChangeText={setText}
          onBlur={save}
          multiline
          maxLength={MAX_LENGTH}
          autoCapitalize="sentences"
        />
        <AppText variant="caption">
          {text.length} / {MAX_LENGTH}
        </AppText>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
