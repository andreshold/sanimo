import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/ui';

/** E21 — écran provisoire (étape 4). */
export default function DescriptionScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('triage.descriptionTitle')} code="E21" next="/symptomes" step={{ current: 2, total: 5 }} ijans />;
}
