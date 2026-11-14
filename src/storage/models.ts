/**
 * État des modèles d'IA sur le téléphone (table `models`).
 * Le téléchargement lui-même arrive à l'étape 11 ; ici, seulement la lecture et l'écriture de l'état.
 */
import type { ModelId, ModelState } from '@/ai/types';

import type { Db } from './db';

/** Les trois modèles nécessaires à la voix et à la compréhension */
export const REQUIRED_MODELS: readonly ModelId[] = ['oswald', 'makandal', 'fatiman'];

export interface ModelRecord {
  id: ModelId;
  state: ModelState;
  bytesDone: number;
  bytesTotal: number;
  path: string | null;
  updatedAt: number;
}

interface Row {
  id: ModelId;
  state: ModelState;
  bytes_done: number;
  bytes_total: number;
  path: string | null;
  updated_at: number;
}

export function listModels(db: Db): ModelRecord[] {
  return db.all<Row>('SELECT * FROM models ORDER BY id').map((r) => ({
    id: r.id,
    state: r.state,
    bytesDone: r.bytes_done,
    bytesTotal: r.bytes_total,
    path: r.path,
    updatedAt: r.updated_at,
  }));
}

export function saveModel(db: Db, m: Omit<ModelRecord, 'updatedAt'>, now = Date.now()): void {
  db.run(
    `INSERT INTO models (id, state, bytes_done, bytes_total, path, updated_at) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET state = excluded.state, bytes_done = excluded.bytes_done,
       bytes_total = excluded.bytes_total, path = excluded.path, updated_at = excluded.updated_at`,
    [m.id, m.state, m.bytesDone, m.bytesTotal, m.path, now],
  );
}

/** Le pack est prêt quand les trois modèles sont téléchargés et vérifiés */
export function isAiPackReady(db: Db): boolean {
  const ready = new Set(listModels(db).filter((m) => m.state === 'ready' || m.state === 'loaded').map((m) => m.id));
  return REQUIRED_MODELS.every((id) => ready.has(id));
}
