/**
 * Ouverture de la base de l'application avec expo-sqlite (module natif).
 * Séparé de db.ts pour que les tests n'importent jamais expo-sqlite.
 */
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import { migrate, type Db } from './db';

const DB_NAME = 'sanimo.db';

function wrap(sqlite: SQLiteDatabase): Db {
  return {
    exec: (sql) => sqlite.execSync(sql),
    run: (sql, params = []) => ({ changes: sqlite.runSync(sql, params).changes }),
    all: (sql, params = []) => sqlite.getAllSync(sql, params),
    first: (sql, params = []) => sqlite.getFirstSync(sql, params),
    transaction: (task) => sqlite.withTransactionSync(task),
  };
}

let instance: Db | null = null;

/** Base ouverte une seule fois, migrée au premier accès (synchrone : pas d'écran d'attente). */
export function getDb(): Db {
  if (!instance) {
    const sqlite = openDatabaseSync(DB_NAME);
    sqlite.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    instance = wrap(sqlite);
    migrate(instance);
  }
  return instance;
}
