import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/ui';

/** E30 — écran provisoire (étape 4). */
export default function ResultScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('triage.resultTitle')} code="E30" next="/consignes" step={{ current: 5, total: 5 }} ijans />;
}
