import { Text, type TextProps } from 'react-native';

import { typography, type TextVariant } from './theme';

/** Seul composant de texte de l'app : les écrans ne touchent jamais à fontSize ni fontFamily. */
export function AppText({ variant = 'body', style, ...props }: TextProps & { variant?: TextVariant }) {
  const isHeading = variant === 'display' || variant === 'h1' || variant === 'h2' || variant === 'h3';
  return <Text accessibilityRole={isHeading ? 'header' : undefined} style={[typography[variant], style]} {...props} />;
}
