/**
 * Jeu de cas — lexique + moteur (feuille de route D3, étape 5).
 *
 * S'active dès que D2 livre src/ai/lexique.ts avec cette signature :
 *   export function detectWithLexicon(text: string): string[]
 * (ids de content/symptomes.json ; textes en créole uniquement). En attendant, la suite est ignorée (« skipped »).
 *
 * Exigences (PLAN §8.1) :
 * - rappel des symptômes ≥ 80 % ;
 * - aucun cas d'alerte qui finit sous ijans une fois les symptômes détectés confirmés ;
 * - aucune détection du symptôme nié dans les phrases niées de la banque.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

import type { TestCase } from '@/triage/content-types';
import { evaluate } from '@/triage';
import type { TriageOutput } from '@/triage/types';
import cases from './cas.json';
import negatives from './phrases-niees.json';

type Detect = (text: string) => string[];

const LEXIQUE = join(__dirname, '..', '..', 'src', 'ai', 'lexique.ts');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const detect: Detect | undefined = existsSync(LEXIQUE) ? require(LEXIQUE).detectWithLexicon : undefined;

const allCases = cases as TestCase[];
const suite = detect ? describe : describe.skip;

/** Parcours complet : symptômes détectés confirmés, toutes les questions répondues « non » */
function runDetected(c: TestCase, detected: string[]): TriageOutput {
  const answers: Record<string, 'wi' | 'non' | 'mpakonnen'> = { ...c.answers };
  const input = { species: c.species, age: c.age, sex: c.sex, symptoms: detected, answers };
  let out = evaluate(input);
  while (out.nextQuestionId) {
    answers[out.nextQuestionId] = answers[out.nextQuestionId] ?? 'non';
    out = evaluate(input);
  }
  return out;
}

suite('jeu de cas — lexique + moteur', () => {
  const results = allCases.map((c) => ({ c, detected: detect ? detect(c.text) : [] }));

  it('rappel des symptômes ≥ 80 %', () => {
    let expected = 0;
    let found = 0;
    const misses: string[] = [];
    for (const { c, detected } of results) {
      for (const s of c.expectedSymptoms) {
        expected++;
        if (detected.includes(s)) found++;
        else misses.push(`${c.id} : ${s}`);
      }
    }
    const recall = found / expected;
    console.log(`Rappel lexique : ${(recall * 100).toFixed(1)} % (${found}/${expected})\nManqués :\n${misses.join('\n')}`);
    expect(recall).toBeGreaterThanOrEqual(0.8);
  });

  it('aucun cas d’alerte ne finit sous ijans', () => {
    const failures = results
      .filter(({ c }) => c.kind === 'alerte')
      .map(({ c, detected }) => ({ id: c.id, detected, level: runDetected(c, detected).level }))
      .filter((r) => r.level !== 'ijans');
    expect(failures).toEqual([]);
  });

  it('ne détecte pas le symptôme nié', () => {
    const falsePositives = negatives
      .filter((p) => detect!(p.text).includes(p.symptomId))
      .map((p) => `${p.id} : « ${p.text} »`);
    expect(falsePositives).toEqual([]);
  });
});

if (!detect) {
  it.todo('chaîne lexique + moteur : en attente de src/ai/lexique.ts (D2)');
}
