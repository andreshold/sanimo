import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/ui';

/** E23 — écran provisoire (étape 4). */
export default function QuestionsScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('triage.questionsTitle')} code="E23" next="/resultat" step={{ current: 4, total: 5 }} ijans />;
}
