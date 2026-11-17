/**
 * Réglages de l'utilisateur, persistés sur le téléphone (SQLite clé-valeur, synchrone).
 * Lecture synchrone au démarrage : pas de flash d'écran ni de redirection tardive.
 * Les tables d'évaluations arrivent à l'étape 5.
 */
import Storage from 'expo-sqlite/kv-store';
import { useSyncExternalStore } from 'react';

export interface Settings {
  /** Avertissement « Sanimo pa ranplase yon veterinè » accepté (E02) */
  disclaimerAccepted: boolean;
  /** Écran du pack IA (E03) vu au moins une fois : téléchargé ou « continuer sans IA » */
  aiPackPromptSeen: boolean;
  /** Lecture automatique des clips à l'arrivée sur un écran */
  autoplay: boolean;
}

const KEY = 'sanimo.settings.v1';
const DEFAULTS: Settings = { disclaimerAccepted: false, aiPackPromptSeen: false, autoplay: true };

function read(): Settings {
  try {
    const raw = Storage.getItemSync(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

let current: Settings = read();
const listeners = new Set<() => void>();

export function getSettings(): Settings {
  return current;
}

export function updateSettings(patch: Partial<Settings>): void {
  current = { ...current, ...patch };
  Storage.setItemSync(KEY, JSON.stringify(current));
  listeners.forEach((l) => l());
}

/** Efface les réglages (utilisé par « Efase done mwen yo », E80). */
export function resetSettings(): void {
  current = DEFAULTS;
  Storage.removeItemSync(KEY);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettings);
}

/** L'onboarding (avertissement + écran du pack IA) est terminé */
export function isOnboarded(s: Settings): boolean {
  return s.disclaimerAccepted && s.aiPackPromptSeen;
}
