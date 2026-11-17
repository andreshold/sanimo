/**
 * Moteur de triage : fonction pure (pas de réseau, pas d'aléatoire, pas de date).
 * Algorithme : TRD §6.2, précisé dans la feuille de route D3 §5 (étape 3).
 *
 * Garanties :
 * 1. un signe d'alerte confirmé, ou une question d'alerte répondue « wi », donne toujours ijans
 *    (règles alerte_* générées par tools/content/build.mts) ;
 * 2. les questions d'alerte ne sont jamais coupées : le plafond ne s'applique qu'aux questions
 *    de durée, d'évolution et de contexte, et s'il en coupe une, le niveau monte au moins à konsilte ;
 * 3. le niveau proposé par le modèle peut relever le niveau, jamais l'abaisser ;
 * 4. dans le doute sur le sexe d'un chat, on se comporte comme pour un mâle (questions et règles).
 */

import type { Condition, Question, Rule, TriageContent } from './content-types';
import type { Evaluate, Level, TriageInput, TriageOutput } from './types';

/** Nombre maximal de questions de durée, d'évolution ou de contexte (les questions d'alerte ne comptent pas) */
export const MAX_FOLLOWUP_QUESTIONS = 10;

/** Règle ajoutée quand le plafond a coupé des questions (texte dans content/regles.json) */
export const CAP_RULE_ID = 'plafond_questions';

/** Consignes toujours affichées, quel que soit le niveau */
export const ALWAYS_ADVICE_IDS = ['gen_pas_medicament_humain'];

/** Consignes ajoutées à tout résultat qui n'est pas ijans : quand revenir vers le vétérinaire */
export const RETURN_ADVICE_IDS = ['ret_general'];

const RANK: Record<Level, number> = { siveye: 0, konsilte: 1, ijans: 2 };
const SPECIES = ['chien', 'chat'];
const AGES = ['jenn', 'adilt', 'granmoun'];

export function maxLevel(...levels: (Level | undefined)[]): Level {
  return levels.reduce<Level>((acc, l) => (l && RANK[l] > RANK[acc] ? l : acc), 'siveye');
}

export function createEvaluate(content: TriageContent): Evaluate {
  const symptomById = new Map(content.symptoms.map((s) => [s.id, s]));
  const questionById = new Map(content.questions.map((q) => [q.id, q]));
  // Ordre stable : priorité, puis id
  const questionsInOrder = [...content.questions].sort(
    (a, b) => a.priority - b.priority || a.id.localeCompare(b.id),
  );
  const isAlert = (q: Question) => q.kind === 'alerte';

  return function evaluate(input: TriageInput): TriageOutput {
    // Une entrée mal formée ne doit jamais donner silencieusement « siveye »
    if (!SPECIES.includes(input.species)) throw new Error(`Espèce invalide : ${String(input.species)}`);
    if (!AGES.includes(input.age)) throw new Error(`Âge invalide : ${String(input.age)}`);

    // Sexe inconnu → on ne filtre pas : un chat dont on ignore le sexe reçoit les questions du mâle
    const sexMatches = (sex: 'male' | 'femelle') => input.sex === undefined || input.sex === sex;
    const isEligible = (q: Question) =>
      (!q.species || q.species.includes(input.species)) &&
      (!q.sex || sexMatches(q.sex)) &&
      (!q.age || q.age.includes(input.age));

    // 1. Symptômes effectifs
    const present = new Set<string>();
    for (const id of input.symptoms) {
      if (symptomById.get(id)?.species.includes(input.species)) present.add(id);
    }
    const answered = Object.entries(input.answers)
      .map(([id, answer]) => ({ q: questionById.get(id), answer }))
      .filter((a): a is { q: Question; answer: TriageInput['answers'][string] } => a.q !== undefined);
    for (const { q, answer } of answered) {
      const s = q.symptomId ? symptomById.get(q.symptomId) : undefined;
      if (answer !== 'wi' || !s) continue;
      // Un « wi » à un signe d'alerte compte toujours, même si la question n'est plus éligible
      // (ex. sexe corrigé après coup) ; les autres seulement pour l'espèce concernée.
      if (s.alert || (isEligible(q) && s.species.includes(input.species))) present.add(s.id);
    }

    const matches = (c: Condition): boolean => {
      if ('sym' in c) return present.has(c.sym);
      if ('rep' in c) return input.answers[c.rep] === c.value;
      if ('species' in c) return input.species === c.species;
      if ('sex' in c) return sexMatches(c.sex);
      return input.age === c.age;
    };

    // 2. Règles déclenchées, du niveau le plus haut au plus bas (ordre du fichier à niveau égal)
    const triggered: Rule[] = content.rules
      .filter((r) => r.when.length > 0 && r.when.every(matches))
      .sort((a, b) => RANK[b.level] - RANK[a.level]);

    // 3. Questions restantes : toutes les questions d'alerte, les autres dans la limite du plafond
    const askedSymptoms = new Set(answered.map(({ q }) => q.symptomId).filter((s): s is string => !!s));
    const remaining = questionsInOrder.filter(
      (q) =>
        isEligible(q) &&
        input.answers[q.id] === undefined &&
        !(q.symptomId && (present.has(q.symptomId) || askedSymptoms.has(q.symptomId))) &&
        (q.always || q.askedIf.some((s) => present.has(s))),
    );
    const followupsAsked = answered.filter(({ q }) => !isAlert(q)).length;
    const followupsLeft = Math.max(0, MAX_FOLLOWUP_QUESTIONS - followupsAsked);
    const alertsLeft = remaining.filter(isAlert);
    const followups = remaining.filter((q) => !isAlert(q));
    const allowed = new Set([...alertsLeft, ...followups.slice(0, followupsLeft)]);
    const capped = followups.length > followupsLeft;

    const progress = { asked: answered.length, max: answered.length + allowed.size };

    // 4. Résultat immédiat si une règle ou le modèle donne ijans ; sinon prochaine question permise
    const urgent = input.modelLevel === 'ijans' || triggered.some((r) => r.level === 'ijans');
    const next = urgent ? undefined : remaining.find((q) => allowed.has(q));
    if (next) {
      return {
        level: null,
        nextQuestionId: next.id,
        reasons: [],
        adviceIds: [],
        rulesVersion: content.rulesVersion,
        progress,
      };
    }

    // 5. Niveau final = max(règles, modèle, plafond) ; aucune règle → siveye
    const level = maxLevel(...triggered.map((r) => r.level), input.modelLevel, capped ? 'konsilte' : undefined);
    const reasons = triggered.map((r) => r.id);
    if (capped && !urgent) reasons.push(CAP_RULE_ID);
    const adviceIds = [
      ...new Set([
        ...triggered.flatMap((r) => r.adviceIds),
        ...(level === 'ijans' ? [] : RETURN_ADVICE_IDS),
        ...ALWAYS_ADVICE_IDS,
      ]),
    ];
    return { level, nextQuestionId: null, reasons, adviceIds, rulesVersion: content.rulesVersion, progress };
  };
}
