import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/ui';

/** E20 — écran provisoire (étape 4). */
export default function AnimalScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('triage.animalTitle')} code="E20" next="/description" step={{ current: 1, total: 5 }} ijans />;
}
