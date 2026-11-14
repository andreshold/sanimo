import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/ui';

/** E31 — écran provisoire (étape 4). */
export default function AdviceScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('triage.adviceTitle')} code="E31" ijans />;
}
