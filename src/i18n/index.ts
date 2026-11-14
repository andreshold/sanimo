import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { Lang } from '@/ai/types';
import { getSettings, updateSettings } from '@/storage/settings';

import { fr } from './fr';
import { ht } from './ht';

export const resources = { ht: { translation: ht }, fr: { translation: fr } } as const;

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: (typeof resources)['ht'];
  }
}

/** Instance dédiée (initReactI18next la rend disponible à useTranslation). */
const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  // Kreyòl par défaut (PRD) ; la langue choisie en E01 est relue au démarrage
  lng: getSettings().lang ?? 'ht',
  fallbackLng: 'ht',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLanguage(lang: Lang) {
  updateSettings({ lang });
  i18n.changeLanguage(lang);
}

export default i18n;
