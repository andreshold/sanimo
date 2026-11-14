import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/ui';

/** E70 — écran provisoire (étape 4). */
export default function HistoryScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('screens.history')} code="E70" />;
}
