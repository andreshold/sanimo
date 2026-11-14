import { createMemoryDb } from '../../tests/helpers/node-db';
import { migrate } from './db';
import { isAiPackReady, listModels, saveModel } from './models';

function freshDb() {
  const db = createMemoryDb();
  migrate(db);
  return db;
}

const base = { bytesDone: 0, bytesTotal: 100, path: null };

describe('état des modèles d’IA', () => {
  it('pack absent sur un téléphone neuf', () => {
    expect(isAiPackReady(freshDb())).toBe(false);
  });

  it('pack prêt seulement quand les trois modèles sont prêts', () => {
    const db = freshDb();
    saveModel(db, { ...base, id: 'oswald', state: 'ready' });
    saveModel(db, { ...base, id: 'makandal', state: 'ready' });
    expect(isAiPackReady(db)).toBe(false);
    saveModel(db, { ...base, id: 'fatiman', state: 'downloading' });
    expect(isAiPackReady(db)).toBe(false);
    saveModel(db, { ...base, id: 'fatiman', state: 'loaded' });
    expect(isAiPackReady(db)).toBe(true);
  });

  it('met à jour un modèle existant au lieu d’en créer un second', () => {
    const db = freshDb();
    saveModel(db, { ...base, id: 'oswald', state: 'downloading', bytesDone: 10 }, 1);
    saveModel(db, { ...base, id: 'oswald', state: 'paused', bytesDone: 40 }, 2);
    expect(listModels(db)).toEqual([
      { id: 'oswald', state: 'paused', bytesDone: 40, bytesTotal: 100, path: null, updatedAt: 2 },
    ]);
  });
});
