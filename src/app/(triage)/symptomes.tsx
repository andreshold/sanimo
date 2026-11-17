import { router } from 'expo-router';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { detectSymptomsSimulated, normalize } from '@/ai/simulation';
import { getAssessmentSession, useAssessment } from '@/session';
import { initialSymptomSelection } from '@/session/triage-flow';
import { triageContent } from '@/triage';
import type { Symptom } from '@/triage/content-types';
import { AppText, Banner, Button, Card, CheckRow, ProgressSteps, Screen, TextField, spacing } from '@/ui';

/**
 * E22 — Symptômes détectés. L'utilisateur confirme ou retire chaque symptôme et peut en ajouter
 * depuis la liste fermée (par catégorie, avec recherche). L'IA ne décide jamais seule : seul ce qui
 * est coché ici part au moteur de règles.
 */
export default function SymptomsScreen() {
  const { t } = useTranslation();
  const assessment = useAssessment();
  const species = assessment?.species ?? null;
  const transcript = assessment?.transcript ?? '';

  useEffect(() => {
    if (!assessment?.species || !assessment?.age) router.replace('/animal');
  }, [assessment?.species, assessment?.age]);

  // Symptômes possibles pour cette espèce
  const available = useMemo(
    () => (species ? triageContent.symptoms.filter((s) => s.species.includes(species)) : []),
    [species],
  );
  const byId = useMemo(() => new Map(available.map((s) => [s.id, s])), [available]);

  const detected = useMemo(
    () => (species && transcript ? detectSymptomsSimulated(transcript, species) : []),
    [species, transcript],
  );

  // Lignes affichées en haut (détectés + ajoutés) et cases cochées
  const [shown, setShown] = useState<string[]>(() =>
    initialSymptomSelection(assessment?.symptoms ?? [], detected).filter((id) => byId.has(id)),
  );
  const [checked, setChecked] = useState<Set<string>>(() => new Set(shown));
  const [browsing, setBrowsing] = useState(false);
  const [query, setQuery] = useState('');

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const add = (id: string) => {
    if (!shown.includes(id)) setShown((s) => [...s, id]);
    setChecked((prev) => new Set(prev).add(id));
  };

  // Liste complète, filtrée par la recherche, groupée par catégorie
  const groups = useMemo(() => {
    const q = normalize(query).trim();
    const rest = available.filter((s) => !shown.includes(s.id) && (!q || normalize(s.label).includes(q)));
    const map = new Map<string, Symptom[]>();
    for (const s of rest) map.set(s.category, [...(map.get(s.category) ?? []), s]);
    return [...map.entries()];
  }, [available, shown, query]);

  const confirm = () => {
    // Ordre d'affichage conservé ; seuls les symptômes cochés partent au moteur
    getAssessmentSession().update({ symptoms: shown.filter((id) => checked.has(id)) });
    router.push('/questions');
  };

  return (
    <Screen ijans footer={<Button title={t('common.next')} onPress={confirm} />}>
      <ProgressSteps current={3} total={5} />
      <AppText variant="h1">{t('triage.symptomsTitle')}</AppText>

      {assessment?.transcript ? (
        <Card>
          <AppText variant="caption">{t('triage.youSaid')}</AppText>
          <AppText>« {assessment.transcript} »</AppText>
        </Card>
      ) : null}

      {shown.length === 0 ? (
        <Banner tone="info">{t('triage.noneDetected')}</Banner>
      ) : (
        <>
          <AppText variant="small">{t('triage.symptomsHint')}</AppText>
          <View style={styles.list}>
            {shown.map((id) => {
              const s = byId.get(id)!;
              return (
                <CheckRow
                  key={id}
                  label={s.label}
                  checked={checked.has(id)}
                  alert={s.alert}
                  alertLabel={t('triage.alertSign')}
                  onToggle={() => toggle(id)}
                />
              );
            })}
          </View>
        </>
      )}

      <Button
        title={browsing ? t('triage.hideList') : t('triage.addSymptom')}
        icon={browsing ? ChevronUp : ChevronDown}
        variant="secondary"
        size="md"
        onPress={() => setBrowsing((b) => !b)}
      />

      {browsing && (
        <View style={styles.list}>
          <TextField placeholder={t('triage.searchSymptom')} value={query} onChangeText={setQuery} autoCorrect={false} />
          {groups.length === 0 && <AppText variant="small">{t('triage.noResult')}</AppText>}
          {groups.map(([category, items]) => (
            <View key={category} style={styles.list}>
              <AppText variant="h3">{t(`triage.category.${category}` as 'triage.category.general')}</AppText>
              {items.map((s) => (
                <CheckRow
                  key={s.id}
                  label={s.label}
                  checked={false}
                  alert={s.alert}
                  alertLabel={t('triage.alertSign')}
                  onToggle={() => add(s.id)}
                />
              ))}
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
});
