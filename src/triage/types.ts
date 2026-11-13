/**
 * Contrat D1 (application) ↔ D3 (moteur de règles).
 * Le moteur est une fonction pure, testée, sans dépendance à React ni à l'IA.
 */

export type Level = 'ijans' | 'konsilte' | 'siveye';

export type Species = 'chien' | 'chat';

export type AgeGroup = 'jenn' | 'adilt' | 'granmoun';

export type Answer = 'wi' | 'non' | 'mpakonnen';

export interface TriageInput {
  species: Species;
  age: AgeGroup;
  sex?: 'male' | 'femelle';
  /** Symptômes confirmés par l'utilisateur (identifiants de content/symptomes) */
  symptoms: string[];
  /** Réponses aux questions oui/non, par identifiant de question */
  answers: Record<string, Answer>;
}

export interface TriageOutput {
  /** null tant qu'une question reste à poser */
  level: Level | null;
  nextQuestionId: string | null;
  /** Identifiants de raisons, affichés via content/ (jamais de texte généré) */
  reasons: string[];
  adviceIds: string[];
  rulesVersion: string;
}

export type Evaluate = (input: TriageInput) => TriageOutput;
