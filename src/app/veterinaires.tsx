import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/ui';

/** E50 — écran provisoire (étape 4). */
export default function VetsScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('screens.vets')} code="E50" />;
}
