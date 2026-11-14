/**
 * Dépôt des évaluations : seule porte d'accès à la table `assessments`.
 * Rien n'identifie la personne : pas de nom, de numéro ni de position (App flow §13).
 */
import type { Lang } from '@/ai/types';
import type { AgeGroup, Answer, Level, Species } from '@/triage/types';

import type { Db, SqlValue } from './db';

export type AssessmentStatus = 'in_progress' | 'done' | 'abandoned';
export type InputMode = 'voice' | 'text';

export interface Assessment {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: AssessmentStatus;
  lang: Lang;
  species: Species | null;
  age: AgeGroup | null;
  sex: 'male' | 'femelle' | null;
  inputMode: InputMode | null;
  transcript: string | null;
  symptoms: string[];
  answers: Record<string, Answer>;
  level: Level | null;
  reasons: string[];
  adviceIds: string[];
  rulesVersion: string | null;
  photoUri: string | null;
}

/** Champs modifiables pendant le parcours */
export type AssessmentPatch = Partial<Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>>;

interface Row {
  id: string;
  created_at: number;
  updated_at: number;
  status: AssessmentStatus;
  lang: Lang;
  species: Species | null;
  age: AgeGroup | null;
  sex: 'male' | 'femelle' | null;
  input_mode: InputMode | null;
  transcript: string | null;
  symptoms: string;
  answers: string;
  level: Level | null;
  reasons: string;
  advice_ids: string;
  rules_version: string | null;
  photo_uri: string | null;
}

/** Correspondance champ TypeScript → colonne SQL (+ encodage JSON des listes) */
const COLUMNS: { [K in keyof AssessmentPatch]-?: { col: keyof Row; json?: true } } = {
  status: { col: 'status' },
  lang: { col: 'lang' },
  species: { col: 'species' },
  age: { col: 'age' },
  sex: { col: 'sex' },
  inputMode: { col: 'input_mode' },
  transcript: { col: 'transcript' },
  symptoms: { col: 'symptoms', json: true },
  answers: { col: 'answers', json: true },
  level: { col: 'level' },
  reasons: { col: 'reasons', json: true },
  adviceIds: { col: 'advice_ids', json: true },
  rulesVersion: { col: 'rules_version' },
  photoUri: { col: 'photo_uri' },
};

function parse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function fromRow(r: Row): Assessment {
  return {
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    status: r.status,
    lang: r.lang,
    species: r.species,
    age: r.age,
    sex: r.sex,
    inputMode: r.input_mode,
    transcript: r.transcript,
    symptoms: parse(r.symptoms, []),
    answers: parse(r.answers, {}),
    level: r.level,
    reasons: parse(r.reasons, []),
    adviceIds: parse(r.advice_ids, []),
    rulesVersion: r.rules_version,
    photoUri: r.photo_uri,
  };
}

/** Identifiant unique local (pas besoin de cryptographie : il ne quitte pas le téléphone) */
export function newId(now = Date.now()): string {
  return `${now.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createAssessment(db: Db, init: { lang: Lang }, now = Date.now()): Assessment {
  const id = newId(now);
  db.run(
    `INSERT INTO assessments (id, created_at, updated_at, status, lang) VALUES (?, ?, ?, 'in_progress', ?)`,
    [id, now, now, init.lang],
  );
  return getAssessment(db, id)!;
}

export function getAssessment(db: Db, id: string): Assessment | null {
  const row = db.first<Row>('SELECT * FROM assessments WHERE id = ?', [id]);
  return row ? fromRow(row) : null;
}

export function updateAssessment(db: Db, id: string, patch: AssessmentPatch, now = Date.now()): Assessment | null {
  const sets: string[] = ['updated_at = ?'];
  const values: SqlValue[] = [now];
  for (const [key, value] of Object.entries(patch) as [keyof AssessmentPatch, unknown][]) {
    const spec = COLUMNS[key];
    if (!spec || value === undefined) continue;
    sets.push(`${spec.col} = ?`);
    values.push(spec.json ? JSON.stringify(value) : (value as SqlValue));
  }
  db.run(`UPDATE assessments SET ${sets.join(', ')} WHERE id = ?`, [...values, id]);
  return getAssessment(db, id);
}

/** Évaluations terminées, de la plus récente à la plus ancienne (historique E70) */
export function listDoneAssessments(db: Db, limit = 100): Assessment[] {
  return db
    .all<Row>(`SELECT * FROM assessments WHERE status = 'done' ORDER BY updated_at DESC LIMIT ?`, [limit])
    .map(fromRow);
}

/** Délai au-delà duquel une évaluation interrompue n'est plus proposée en reprise */
export const RESUME_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Dernière évaluation interrompue récente, proposée en reprise sur E10 */
export function findResumable(db: Db, now = Date.now()): Assessment | null {
  const row = db.first<Row>(
    `SELECT * FROM assessments WHERE status = 'in_progress' AND updated_at >= ? ORDER BY updated_at DESC LIMIT 1`,
    [now - RESUME_WINDOW_MS],
  );
  return row ? fromRow(row) : null;
}

/** Marque toutes les évaluations en cours comme abandonnées (au démarrage d'une nouvelle) */
export function abandonInProgress(db: Db, now = Date.now()): number {
  return db.run(`UPDATE assessments SET status = 'abandoned', updated_at = ? WHERE status = 'in_progress'`, [now])
    .changes;
}

export function deleteAssessment(db: Db, id: string): boolean {
  return db.run('DELETE FROM assessments WHERE id = ?', [id]).changes > 0;
}

export function deleteAllAssessments(db: Db): number {
  return db.run('DELETE FROM assessments').changes;
}
