/**
 * Format du contenu généré dans content/*.json (D3 → D1, D2).
 * Source de vérité : les tableurs de content-sources/, convertis par tools/content/build.mts.
 * Aucun texte affiché n'est fabriqué par le code ou par l'IA : tout vient d'ici.
 * Textes en créole haïtien uniquement (l'application n'a pas de version française).
 */

import type { AgeGroup, Level, Species } from './types';

/** brouillon → relu_ht (locuteur natif) → valide (vétérinaire) */
export type Status = 'brouillon' | 'relu_ht' | 'valide';

export interface Symptom {
  id: string;
  category: string;
  species: Species[];
  label: string;
  /** Signe d'alerte : confirmé ou répondu « wi » → toujours ijans */
  alert: boolean;
  minLevel: Level;
  /** Question oui/non qui demande ce symptôme */
  questionId: string;
  status: Status;
}

export type QuestionKind = 'alerte' | 'duree' | 'evolution' | 'contexte';

export interface Question {
  id: string;
  kind: QuestionKind;
  text: string;
  /** Symptôme demandé par la question (« wi » = symptôme présent) */
  symptomId?: string;
  species?: Species[];
  sex?: 'male' | 'femelle';
  age?: AgeGroup[];
  /** Posée si l'un de ces symptômes est confirmé */
  askedIf: string[];
  /** Posée à chaque évaluation (questions d'alerte de base) */
  always: boolean;
  /** Plus petit = posé plus tôt */
  priority: number;
  /** Niveau appliqué si la réponse est « m pa konnen » */
  levelIfUnknown: Level;
  clipId?: string;
  status: Status;
}

export type Condition =
  | { sym: string }
  | { rep: string; value: 'wi' | 'non' | 'mpakonnen' }
  | { species: Species }
  | { sex: 'male' | 'femelle' }
  | { age: AgeGroup };

export interface Rule {
  id: string;
  /** Toutes les conditions doivent être vraies (ET) */
  when: Condition[];
  level: Level;
  reason: string;
  adviceIds: string[];
  source: string;
  status: Status;
}

export type AdviceType = 'a_faire' | 'a_ne_pas_faire' | 'information' | 'signe_retour';

export interface Advice {
  id: string;
  context: string;
  type: AdviceType;
  /** chien, chat, ou humain (consignes rage pour la personne mordue) */
  species: string[];
  text: string;
  clipId?: string;
  status: Status;
}

export interface Toxic {
  id: string;
  category: string;
  name: string;
  localNames: string[];
  species: Species[];
  level: Level;
  message: string;
  clipId?: string;
  status: Status;
}

export interface Vet {
  id: string;
  name: string;
  commune: string;
  department: string;
  phone: string;
  whatsapp?: string;
  hours: string;
  emergency24h: boolean;
  /** AAAA-MM-JJ */
  verifiedOn: string;
  status: Status;
}

/**
 * Clip audio lu à voix haute (content/clips.json) ; fichier : assets/clips/<id>.mp3 (généré par D2).
 * Le texte du clip est toujours identique au texte affiché :
 * - clips de contenu (`clip_q_*` question, `clip_c_*` consigne, `clip_t_*` toxique) : générés depuis le contenu ;
 * - clips d'écran (`clip_e<nn>_*`) : content-sources/clips.csv. Avec `i18nKey`, le texte est celui de
 *   src/i18n/ht.ts (vérifié par tests/clips.test.ts) ; sans `i18nKey`, l'écran affiche `text` lui-même.
 */
export interface Clip {
  id: string;
  /** Écran du parcours (E02, E23, E31…) */
  screen: string;
  text: string;
  /** Clé de src/i18n/ht.ts qui affiche le même texte */
  i18nKey?: string;
  /** Élément de contenu lu par ce clip (questions:q_x, consignes:x, toxiques:x) */
  contentRef?: string;
  words: number;
  status: Status;
}

/** Lexique de repli (content/lexique.json), lu par src/ai/lexique.ts (D2) */
export interface LexiconEntry {
  id: string;
  symptomId: string;
  term: string;
  /** Formes normalisées : minuscules, sans accents, variantes d'orthographe */
  variants: string[];
  /** Terme signalé comme risque de faux positif (colonne note) */
  risky: boolean;
  status: Status;
}

/** Cas du jeu de test (tests/cas/cas.json) */
export interface TestCase {
  id: string;
  species: Species;
  age: AgeGroup;
  sex?: 'male' | 'femelle';
  text: string;
  expectedSymptoms: string[];
  expectedLevel: Level;
  kind: 'alerte' | 'non_alerte' | 'piege' | 'negation';
  /** Réponses du propriétaire aux questions (durée, « m pa konnen »…) ; les autres valent « non » */
  answers: Record<string, 'wi' | 'non' | 'mpakonnen'>;
  note: string;
  status: Status;
}

export interface ContentVersion {
  rulesVersion: string;
  generatedAt: string;
  counts: Record<string, Record<Status, number>>;
}

/** Ce dont le moteur a besoin */
export interface TriageContent {
  symptoms: Symptom[];
  questions: Question[];
  rules: Rule[];
  rulesVersion: string;
}
