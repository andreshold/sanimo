import type { Level } from '@/triage/types';

/**
 * Jetons de design Sanimo — source unique des couleurs, espacements et typographie.
 * Charte visuelle v1. Aucune couleur ni taille en dur ailleurs dans l'application.
 */

export const colors = {
  /** Bleu Sanimo — logo, titres, en-têtes, bouton principal */
  primary: '#0F3D5E',
  primaryTint: '#E7EDF2',
  /** Émeraude soin — actions, confirmations, niveau Siveye */
  care: '#237A5E',
  careBg: '#E6F2ED',
  /** Ambre — accents, niveau Konsilte. Jamais de texte blanc dessus (contraste 2,2:1). */
  accent: '#E8A33D',
  accentBg: '#FCF3E3',
  /** Brume — fond de l'interface */
  surface: '#F3F6F7',
  /** Encre — texte courant */
  ink: '#1B2B36',
  inkMuted: '#5B6B76',
  /** Urgence — réservé aux urgences : bouton Ijans, niveau Ijans, alertes */
  danger: '#C0392B',
  dangerBg: '#F9E7E5',
  white: '#FFFFFF',
  border: '#DDE4E8',
} as const;

/** Un niveau est toujours couleur + icône + mot, jamais la couleur seule. */
export const levelColors: Record<Level, { fg: string; bg: string; onFg: string }> = {
  ijans: { fg: colors.danger, bg: colors.dangerBg, onFg: colors.white },
  konsilte: { fg: colors.accent, bg: colors.accentBg, onFg: colors.ink },
  siveye: { fg: colors.care, bg: colors.careBg, onFg: colors.white },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

/** Cibles tactiles minimales (dp) */
export const touch = { min: 48, primary: 56, mic: 96 } as const;

export const fonts = {
  title: 'Montserrat_700Bold',
  titleSemi: 'Montserrat_600SemiBold',
  logo: 'Montserrat_800ExtraBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
} as const;

export const typography = {
  display: { fontFamily: fonts.logo, fontSize: 44, lineHeight: 52, color: colors.primary },
  h1: { fontFamily: fonts.title, fontSize: 28, lineHeight: 34, color: colors.primary },
  h2: { fontFamily: fonts.title, fontSize: 22, lineHeight: 28, color: colors.primary },
  h3: { fontFamily: fonts.titleSemi, fontSize: 18, lineHeight: 24, color: colors.primary },
  body: { fontFamily: fonts.body, fontSize: 17, lineHeight: 25, color: colors.ink },
  bodyStrong: { fontFamily: fonts.bodySemi, fontSize: 17, lineHeight: 25, color: colors.ink },
  small: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.inkMuted },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
  button: { fontFamily: fonts.bodySemi, fontSize: 18, lineHeight: 24 },
  buttonSmall: { fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 20 },
} as const;

export type TextVariant = keyof typeof typography;

/** Ombres (boxShadow, pas les anciennes props elevation) — 2 niveaux suffisent. */
export const shadows = {
  card: '0 1px 2px rgba(15, 61, 94, 0.06)',
  raised: '0 4px 12px rgba(15, 61, 94, 0.12)',
} as const;

/** Durées d'animation (ms) */
export const motion = { fast: 150, base: 250, slow: 400 } as const;

/** Icônes : traits fins (charte : « icônes en traits fins ») */
export const icons = { stroke: 1.75, sm: 18, md: 22, lg: 28, xl: 40 } as const;

/** Opacité d'un élément pressé ou désactivé */
export const states = { pressed: 0.85, disabled: 0.45 } as const;
