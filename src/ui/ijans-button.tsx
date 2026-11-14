import { router } from 'expo-router';
import { Siren } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { StyleProp, ViewStyle } from 'react-native';

import { Button } from './button';

/** Bouton rouge « Ijans kounye a » : toujours le même libellé, la même couleur et la même destination (E11). */
export function IjansButton({ size = 'lg', style }: { size?: 'md' | 'lg'; style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  return (
    <Button
      title={t('common.ijansNow')}
      accessibilityHint={t('common.ijansHint')}
      variant="danger"
      size={size}
      icon={Siren}
      onPress={() => router.push('/ijans')}
      style={style}
    />
  );
}
