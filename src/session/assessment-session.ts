/**
 * Évaluation en cours (parcours E20 → E31).
 *
 * Chaque changement est écrit tout de suite dans SQLite : si l'application est tuée
 * (appel, mémoire, batterie), l'évaluation est proposée en reprise sur E10.
 * La logique ne dépend que de `Db` : elle est testée sans téléphone.
 */
import type { Href } from 'expo-router';

import type { Lang } from '@/ai/types';
import {
  abandonInProgress,
  createAssessment,
  findResumable,
  getAssessment,
  updateAssessment,
  type Assessment,
  type AssessmentPatch,
} from '@/storage/assessments';
import type { Db } from '@/storage/db';
import type { Level } from '@/triage/types';

export interface TriageResult {
  level: Level;
  reasons: string[];
  adviceIds: string[];
  rulesVersion: string;
}

export interface AssessmentSession {
  getCurrent(): Assessment | null;
  subscribe(listener: () => void): () => void;
  /** Nouvelle évaluation (les évaluations interrompues sont marquées abandonnées) */
  start(lang: Lang): Assessment;
  /** Reprend une évaluation interrompue */
  resume(id: string): Assessment | null;
  /** Évaluation interrompue à proposer en reprise, s'il y en a une */
  findResumable(): Assessment | null;
  update(patch: AssessmentPatch): Assessment;
  finish(result: TriageResult): Assessment;
  /** Abandon volontaire (« Rekòmanse ») */
  abandon(): void;
}

export function createAssessmentSession(db: Db, clock: () => number = Date.now): AssessmentSession {
  let current: Assessment | null = null;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  const set = (a: Assessment | null) => {
    current = a;
    emit();
    return a;
  };

  const requireCurrent = (): Assessment => {
    if (!current) throw new Error('Aucune évaluation en cours');
    return current;
  };

  return {
    getCurrent: () => current,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start(lang) {
      const now = clock();
      abandonInProgress(db, now);
      return set(createAssessment(db, { lang }, now))!;
    },
    resume(id) {
      const a = getAssessment(db, id);
      return set(a && a.status === 'in_progress' ? a : null);
    },
    findResumable: () => findResumable(db, clock()),
    update(patch) {
      const a = updateAssessment(db, requireCurrent().id, patch, clock());
      return set(a)!;
    },
    finish(result) {
      const a = updateAssessment(db, requireCurrent().id, { ...result, status: 'done' }, clock());
      return set(a)!;
    },
    abandon() {
      if (current) updateAssessment(db, current.id, { status: 'abandoned' }, clock());
      set(null);
    },
  };
}

/** Écran où reprendre une évaluation interrompue, selon ce qui est déjà rempli */
export function resumeRoute(a: Assessment): Href {
  if (a.level) return '/resultat';
  if (!a.species || !a.age) return '/animal';
  if (!a.transcript && a.symptoms.length === 0) return '/description';
  if (Object.keys(a.answers).length === 0) return '/symptomes';
  return '/questions';
}
