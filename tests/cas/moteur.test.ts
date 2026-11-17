/**
 * Jeu de cas — le moteur seul (feuille de route D3, étape 5).
 * Entrée = symptômes attendus (comme si la détection et la confirmation étaient parfaites).
 * Les questions reçoivent la réponse d'un « oracle » : celle écrite dans le cas (colonne reponses),
 * sinon « wi » si la question porte sur un symptôme attendu, sinon « non ».
 *
 * Exigences : 100 % des cas d'alerte en ijans ; tous les niveaux attendus respectés.
 */

import type { TestCase } from '@/triage/content-types';
import { evaluate, triageContent } from '@/triage';
import type { Answer, TriageOutput } from '@/triage/types';
import cases from './cas.json';

const allCases = cases as TestCase[];
const questionById = new Map(triageContent.questions.map((q) => [q.id, q]));

function run(c: TestCase): TriageOutput {
  const answers: Record<string, Answer> = {};
  const input = { species: c.species, age: c.age, sex: c.sex, symptoms: c.expectedSymptoms, answers };
  let out = evaluate(input);
  while (out.nextQuestionId) {
    const q = questionById.get(out.nextQuestionId)!;
    answers[q.id] =
      c.answers[q.id] ?? (q.symptomId && c.expectedSymptoms.includes(q.symptomId) ? 'wi' : 'non');
    out = evaluate(input);
  }
  return out;
}

describe('jeu de cas — moteur seul', () => {
  it('contient au moins 90 cas, dont un par signe d’alerte', () => {
    expect(allCases.length).toBeGreaterThanOrEqual(90);
    const covered = new Set(allCases.filter((c) => c.kind === 'alerte').flatMap((c) => c.expectedSymptoms));
    const missing = triageContent.symptoms.filter((s) => s.alert && !covered.has(s.id)).map((s) => s.id);
    expect(missing).toEqual([]);
  });

  it('100 % des cas d’alerte finissent en ijans', () => {
    const failures = allCases
      .filter((c) => c.kind === 'alerte')
      .map((c) => ({ id: c.id, level: run(c).level }))
      .filter((r) => r.level !== 'ijans');
    expect(failures).toEqual([]);
  });

  it.each(allCases.map((c) => [c.id, c] as const))('%s → niveau attendu', (_id, c) => {
    expect(run(c).level).toBe(c.expectedLevel);
  });
});
