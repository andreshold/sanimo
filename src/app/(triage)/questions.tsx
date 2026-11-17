import { router } from 'expo-router';
import { Check, CircleHelp, Undo2, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { getAssessmentSession, useAssessment } from '@/session';
import { toTriageInput, withAnswer, withoutLastAnswer } from '@/session/triage-flow';
import { evaluate, triageContent } from '@/triage';
import type { Answer } from '@/triage/types';
import { AppText, Button, Card, ListenButton, ProgressSteps, Screen, spacing } from '@/ui';

const questionById = new Map(triageContent.questions.map((q) => [q.id, q]));

/**
 * E23 — Questions oui / non / m pa konnen, une par écran.
 * Le moteur de règles (D3) choisit la question suivante à chaque réponse ; dès qu'il n'en reste plus
 * (ou dès qu'un signe d'alerte est confirmé), le résultat est enregistré et E30 s'ouvre.
 */
export default function QuestionsScreen() {
  const { t } = useTranslation();
  const assessment = useAssessment();
  const [playing, setPlaying] = useState(false);

  // Recalculé seulement quand l'évaluation change (nouvelle réponse), pas à chaque affichage
  const input = useMemo(() => (assessment ? toTriageInput(assessment) : null), [assessment]);
  const output = useMemo(() => (input ? evaluate(input) : null), [input]);
  const question = output?.nextQuestionId ? questionById.get(output.nextQuestionId) : undefined;

  useEffect(() => {
    if (!input) {
      router.replace('/animal');
      return;
    }
    // Plus de question : le niveau est connu → on enregistre le résultat (une seule fois) et on l'affiche
    if (assessment?.status === 'in_progress' && output && output.nextQuestionId === null && output.level) {
      getAssessmentSession().finish({
        level: output.level,
        reasons: output.reasons,
        adviceIds: output.adviceIds,
        rulesVersion: output.rulesVersion,
      });
      router.replace('/resultat');
    }
  }, [input, output, assessment?.status]);

  if (!assessment || !output || !question) return <Screen ijans>{null}</Screen>;

  const answer = (a: Answer) => {
    setPlaying(false);
    getAssessmentSession().update({ answers: withAnswer(assessment.answers, question.id, a) });
  };

  const previous = () => {
    getAssessmentSession().update({ answers: withoutLastAnswer(assessment.answers).answers });
  };

  const current = output.progress.asked + 1;
  const hasPrevious = Object.keys(assessment.answers).length > 0;

  return (
    <Screen ijans>
      <ProgressSteps current={4} total={5} />
      <AppText variant="caption">{t('triage.questionCount', { current, total: output.progress.max })}</AppText>

      <Card style={styles.question}>
        <AppText variant="h2" accessibilityLiveRegion="polite">
          {question.text}
        </AppText>
        <ListenButton playing={playing} onPress={() => setPlaying((p) => !p)} />
      </Card>

      <View style={styles.answers}>
        <Button title={t('triage.yes')} icon={Check} variant="secondary" onPress={() => answer('wi')} />
        <Button title={t('triage.no')} icon={X} variant="secondary" onPress={() => answer('non')} />
        <Button title={t('triage.dontKnow')} icon={CircleHelp} variant="secondary" onPress={() => answer('mpakonnen')} />
      </View>

      {hasPrevious && (
        <Button title={t('triage.previousQuestion')} icon={Undo2} variant="secondary" size="md" onPress={previous} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  question: { gap: spacing.lg, paddingVertical: spacing.xl },
  answers: { gap: spacing.md },
});
