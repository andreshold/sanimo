/**
 * Session d'évaluation de l'application, branchée sur la base SQLite du téléphone.
 * Les écrans utilisent `useAssessment()` (lecture) et `assessmentSession` (actions).
 */
import { useSyncExternalStore } from 'react';

import { getDb } from '@/storage/app-db';

import { createAssessmentSession, type AssessmentSession } from './assessment-session';

let session: AssessmentSession | null = null;

/** Créée au premier usage : la base n'est ouverte que lorsqu'on en a besoin. */
export function getAssessmentSession(): AssessmentSession {
  if (!session) session = createAssessmentSession(getDb());
  return session;
}

export function useAssessment() {
  const s = getAssessmentSession();
  return useSyncExternalStore(s.subscribe, s.getCurrent);
}

export { resumeRoute, type TriageResult } from './assessment-session';
