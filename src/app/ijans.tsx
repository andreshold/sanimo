import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/ui';

/** E11 — écran provisoire (étape 4). */
export default function IjansScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('screens.ijans')} code="E11" />;
}
