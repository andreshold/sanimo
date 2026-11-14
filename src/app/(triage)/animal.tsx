import { router } from 'expo-router';
import { Cat, Dog, PawPrint } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { getAssessmentSession, useAssessment } from '@/session';
import type { AgeGroup, Species } from '@/triage/types';
import { AppText, Banner, Button, ChoiceCard, ProgressSteps, Screen, spacing } from '@/ui';

type Sex = 'male' | 'femelle';

/**
 * E20 — L'animal : espèce, âge, et sexe pour le chat (utile aux règles urinaires).
 * Chaque choix est enregistré tout de suite dans la session (reprise possible).
 * « Lòt bèt » : Sanimo ne couvre que chiens et chats → message + annuaire.
 */
export default function AnimalScreen() {
  const { t, i18n } = useTranslation();
  const assessment = useAssessment();
  const [other, setOther] = useState(false);

  // Arrivée directe sur l'écran (lien, reprise ratée) : on ouvre une évaluation
  useEffect(() => {
    if (!getAssessmentSession().getCurrent()) {
      getAssessmentSession().start(i18n.language === 'fr' ? 'fr' : 'ht');
    }
  }, [i18n.language]);

  const species = assessment?.species ?? null;
  const age = assessment?.age ?? null;
  const sex = assessment?.sex ?? null;

  const setSpecies = (s: Species) => {
    setOther(false);
    // Le sexe n'est demandé que pour le chat : on l'efface si l'on passe au chien
    getAssessmentSession().update({ species: s, sex: s === 'chat' ? sex : null });
  };
  const setAge = (a: AgeGroup) => getAssessmentSession().update({ age: a });
  const setSex = (s: Sex) => getAssessmentSession().update({ sex: s });

  const complete = !other && species !== null && age !== null && (species !== 'chat' || sex !== null);

  return (
    <Screen
      ijans
      footer={
        <Button
          title={t('common.next')}
          disabled={!complete}
          accessibilityHint={complete ? undefined : t('triage.animalIncomplete')}
          onPress={() => router.push('/description')}
        />
      }
    >
      <ProgressSteps current={1} total={5} />
      <AppText variant="h1">{t('triage.animalTitle')}</AppText>

      <View accessibilityRole="radiogroup" style={styles.group}>
        <ChoiceCard title={t('triage.dog')} icon={Dog} selected={!other && species === 'chien'} onPress={() => setSpecies('chien')} />
        <ChoiceCard title={t('triage.cat')} icon={Cat} selected={!other && species === 'chat'} onPress={() => setSpecies('chat')} />
        <ChoiceCard title={t('triage.otherAnimal')} icon={PawPrint} selected={other} onPress={() => setOther(true)} />
      </View>

      {other && (
        <View style={styles.group}>
          <Banner tone="info">{t('triage.otherAnimalBody')}</Banner>
          <Button title={t('triage.seeVets')} variant="secondary" onPress={() => router.push('/veterinaires')} />
        </View>
      )}

      {!other && species && (
        <View accessibilityRole="radiogroup" style={styles.group}>
          <AppText variant="h2">{t('triage.ageTitle')}</AppText>
          <ChoiceCard
            title={t('triage.ageYoung')}
            subtitle={species === 'chat' ? t('triage.ageYoungCat') : t('triage.ageYoungDog')}
            selected={age === 'jenn'}
            onPress={() => setAge('jenn')}
          />
          <ChoiceCard title={t('triage.ageAdult')} selected={age === 'adilt'} onPress={() => setAge('adilt')} />
          <ChoiceCard title={t('triage.ageSenior')} selected={age === 'granmoun'} onPress={() => setAge('granmoun')} />
        </View>
      )}

      {!other && species === 'chat' && age && (
        <View accessibilityRole="radiogroup" style={styles.group}>
          <AppText variant="h2">{t('triage.sexTitle')}</AppText>
          <View style={styles.row}>
            <ChoiceCard title={t('triage.male')} selected={sex === 'male'} onPress={() => setSex('male')} style={styles.half} />
            <ChoiceCard
              title={t('triage.female')}
              selected={sex === 'femelle'}
              onPress={() => setSex('femelle')}
              style={styles.half}
            />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
});
