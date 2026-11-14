/**
 * Base SQLite de l'application (hors ligne, sur le téléphone).
 *
 * Le code métier ne dépend que de l'interface `Db` : en production elle enveloppe expo-sqlite,
 * dans les tests elle enveloppe node:sqlite (tests/helpers/node-db.ts). Aucune requête n'est
 * écrite ailleurs que dans src/storage/.
 */

export type SqlValue = string | number | null;

export interface Db {
  exec(sql: string): void;
  run(sql: string, params?: SqlValue[]): { changes: number };
  all<T>(sql: string, params?: SqlValue[]): T[];
  first<T>(sql: string, params?: SqlValue[]): T | null;
  transaction(task: () => void): void;
}

/**
 * Migrations dans l'ordre. Ne JAMAIS modifier une migration publiée : en ajouter une nouvelle.
 * La version courante est stockée dans PRAGMA user_version.
 */
export const MIGRATIONS: readonly string[] = [
  // 1 — évaluations et état des modèles d'IA
  `
  CREATE TABLE assessments (
    id            TEXT PRIMARY KEY NOT NULL,
    created_at    INTEGER NOT NULL,
    updated_at    INTEGER NOT NULL,
    status        TEXT NOT NULL CHECK (status IN ('in_progress', 'done', 'abandoned')),
    lang          TEXT NOT NULL,
    species       TEXT,
    age           TEXT,
    sex           TEXT,
    input_mode    TEXT CHECK (input_mode IN ('voice', 'text')),
    transcript    TEXT,
    symptoms      TEXT NOT NULL DEFAULT '[]',
    answers       TEXT NOT NULL DEFAULT '{}',
    level         TEXT CHECK (level IN ('ijans', 'konsilte', 'siveye')),
    reasons       TEXT NOT NULL DEFAULT '[]',
    advice_ids    TEXT NOT NULL DEFAULT '[]',
    rules_version TEXT,
    photo_uri     TEXT
  );
  CREATE INDEX idx_assessments_status_updated ON assessments (status, updated_at DESC);

  CREATE TABLE models (
    id          TEXT PRIMARY KEY NOT NULL,
    state       TEXT NOT NULL,
    bytes_done  INTEGER NOT NULL DEFAULT 0,
    bytes_total INTEGER NOT NULL DEFAULT 0,
    path        TEXT,
    updated_at  INTEGER NOT NULL
  );
  `,
];

export function getSchemaVersion(db: Db): number {
  return db.first<{ user_version: number }>('PRAGMA user_version')?.user_version ?? 0;
}

/** Applique les migrations manquantes, chacune dans une transaction. Idempotent. */
export function migrate(db: Db): number {
  const current = getSchemaVersion(db);
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v]);
      db.exec(`PRAGMA user_version = ${v + 1}`);
    });
  }
  return getSchemaVersion(db);
}
