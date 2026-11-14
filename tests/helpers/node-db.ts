/**
 * Implémentation de `Db` pour les tests, avec le SQLite intégré à Node (node:sqlite, Node ≥ 22.5).
 * Même moteur SQLite que sur le téléphone : les requêtes et migrations sont testées pour de vrai.
 */
import { DatabaseSync } from 'node:sqlite';

import type { Db } from '../../src/storage/db';

export function createMemoryDb(): Db {
  const sqlite = new DatabaseSync(':memory:');
  return {
    exec: (sql) => sqlite.exec(sql),
    run: (sql, params = []) => ({ changes: Number(sqlite.prepare(sql).run(...params).changes) }),
    all: <T>(sql: string, params: (string | number | null)[] = []) => sqlite.prepare(sql).all(...params) as T[],
    first: <T>(sql: string, params: (string | number | null)[] = []) =>
      (sqlite.prepare(sql).get(...params) as T | undefined) ?? null,
    transaction(task) {
      sqlite.exec('BEGIN');
      try {
        task();
        sqlite.exec('COMMIT');
      } catch (e) {
        sqlite.exec('ROLLBACK');
        throw e;
      }
    },
  };
}
