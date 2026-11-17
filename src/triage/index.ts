/**
 * Point d'entrée du moteur pour l'application : branché sur le contenu généré (content/*.json).
 */

import questions from '../../content/questions.json';
import rules from '../../content/regles.json';
import symptoms from '../../content/symptomes.json';
import version from '../../content/version.json';
import type { TriageContent } from './content-types';
import { createEvaluate } from './engine';

// Le JSON est vérifié à la génération (tools/content/build.mts) : on fait confiance à sa forme.
export const triageContent: TriageContent = {
  symptoms: symptoms as TriageContent['symptoms'],
  questions: questions as TriageContent['questions'],
  rules: rules as unknown as TriageContent['rules'],
  rulesVersion: version.rulesVersion,
};

export const evaluate = createEvaluate(triageContent);

export {
  ALWAYS_ADVICE_IDS,
  CAP_RULE_ID,
  createEvaluate,
  MAX_FOLLOWUP_QUESTIONS,
  maxLevel,
  RETURN_ADVICE_IDS,
} from './engine';
export type * from './types';
export type * from './content-types';
