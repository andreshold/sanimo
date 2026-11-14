import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/ui';

/** E22 — écran provisoire (étape 4). */
export default function SymptomsScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('triage.symptomsTitle')} code="E22" next="/questions" step={{ current: 3, total: 5 }} ijans />;
}
