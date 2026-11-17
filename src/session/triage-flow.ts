/**
 * Aides pures pour le parcours E21 → E23 (testées sans téléphone).
 */
import type { Assessment } from '@/storage/assessments';
import type { Answer, TriageInput } from '@/triage/types';

/** Entrée du moteur à partir de l'évaluation ; null si l'animal n'est pas encore décrit (retour à E20) */
export function toTriageInput(a: Assessment): TriageInput | null {
  if (!a.species || !a.age) return null;
  return {
    species: a.species,
    age: a.age,
    sex: a.sex ?? undefined,
    symptoms: a.symptoms,
    answers: a.answers,
  };
}

/** Ajoute une réponse (l'ordre d'insertion sert à revenir à la question précédente) */
export function withAnswer(answers: Record<string, Answer>, questionId: string, answer: Answer): Record<string, Answer> {
  const next = { ...answers };
  delete next[questionId];
  next[questionId] = answer;
  return next;
}

/** Retire la dernière réponse donnée ; renvoie aussi la question à reposer */
export function withoutLastAnswer(answers: Record<string, Answer>): {
  answers: Record<string, Answer>;
  questionId: string | null;
} {
  const ids = Object.keys(answers);
  const last = ids.at(-1) ?? null;
  if (!last) return { answers, questionId: null };
  const next = { ...answers };
  delete next[last];
  return { answers: next, questionId: last };
}

/**
 * Symptômes à cocher sur E22 : à la reprise, ceux déjà confirmés ;
 * sinon, ceux détectés dans la description.
 */
export function initialSymptomSelection(saved: string[], detected: string[]): string[] {
  return saved.length > 0 ? saved : detected;
}
