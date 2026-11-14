import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/ui';

/** E41 — écran provisoire (étape 4). */
export default function ToxicsScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('screens.toxics')} code="E41" ijans />;
}
