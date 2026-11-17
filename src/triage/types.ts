/**
 * Contrat D1 (application) ↔ D3 (moteur de règles).
 * Le moteur est une fonction pure, testée, sans dépendance à React ni à l'IA.
 *
 * Mode d'emploi (D1) : appeler evaluate() après E22, puis à chaque réponse sur E23
 * en ajoutant la réponse dans `answers`. Tant que `nextQuestionId` n'est pas null,
 * afficher la question ; sinon aller sur E30.
 */

export type Level = 'ijans' | 'konsilte' | 'siveye';

export type Species = 'chien' | 'chat';

export type AgeGroup = 'jenn' | 'adilt' | 'granmoun';

export type Answer = 'wi' | 'non' | 'mpakonnen';

export interface TriageInput {
  species: Species;
  age: AgeGroup;
  sex?: 'male' | 'femelle';
  /** Symptômes confirmés par l'utilisateur (ids de content/symptomes) ; ids inconnus ignorés */
  symptoms: string[];
  /** Réponses aux questions oui/non, par identifiant de question */
  answers: Record<string, Answer>;
  /** Niveau proposé par le modèle (Makandal) : peut relever le niveau, jamais l'abaisser */
  modelLevel?: Level;
}

export interface TriageOutput {
  /** null tant qu'une question reste à poser */
  level: Level | null;
  nextQuestionId: string | null;
  /** Identifiants de règles (texte de la raison dans content/regles.json) */
  reasons: string[];
  /** Identifiants de consignes (content/consignes.json), dans l'ordre d'affichage */
  adviceIds: string[];
  rulesVersion: string;
  /** Avancement des questions, pour ProgressSteps sur E23 */
  progress: { asked: number; max: number };
}

export type Evaluate = (input: TriageInput) => TriageOutput;
