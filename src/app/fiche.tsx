import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/ui';

/** E60 — écran provisoire (étape 4). */
export default function VetSheetScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('screens.vetSheet')} code="E60" />;
}
