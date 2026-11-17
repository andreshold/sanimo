import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { ht } from './ht';

/** L'application est entièrement en créole haïtien : pas d'autre langue. */
export const resources = { ht: { translation: ht } } as const;

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: (typeof resources)['ht'];
  }
}

/** Instance dédiée (initReactI18next la rend disponible à useTranslation). */
const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: 'ht',
  fallbackLng: 'ht',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
