import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/ui';

/** E40 — écran provisoire (étape 4). */
export default function RabiesScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('screens.rabies')} code="E40" ijans />;
}
