import { createMemoryDb } from '../../tests/helpers/node-db';
import {
  RESUME_WINDOW_MS,
  abandonInProgress,
  createAssessment,
  deleteAllAssessments,
  findResumable,
  getAssessment,
  listDoneAssessments,
  updateAssessment,
} from './assessments';
import { MIGRATIONS, getSchemaVersion, migrate, type Db } from './db';

const T0 = 1_763_100_000_000; // date fixe : tests reproductibles

function freshDb(): Db {
  const db = createMemoryDb();
  migrate(db);
  return db;
}

describe('migrations', () => {
  it('amène une base vide à la dernière version', () => {
    const db = createMemoryDb();
    expect(getSchemaVersion(db)).toBe(0);
    expect(migrate(db)).toBe(MIGRATIONS.length);
  });

  it('est idempotente (relancer ne casse rien)', () => {
    const db = freshDb();
    expect(() => migrate(db)).not.toThrow();
    expect(getSchemaVersion(db)).toBe(MIGRATIONS.length);
  });
});

describe('dépôt des évaluations', () => {
  it('crée une évaluation en cours avec des listes vides', () => {
    const db = freshDb();
    const a = createAssessment(db, { lang: 'ht' }, T0);
    expect(a).toMatchObject({
      status: 'in_progress',
      lang: 'ht',
      createdAt: T0,
      species: null,
      symptoms: [],
      answers: {},
      reasons: [],
      adviceIds: [],
    });
  });

  it('enregistre et relit les champs, listes et réponses comprises (aller-retour JSON)', () => {
    const db = freshDb();
    const { id } = createAssessment(db, { lang: 'ht' }, T0);
    updateAssessment(
      db,
      id,
      {
        species: 'chat',
        age: 'adilt',
        sex: 'male',
        inputMode: 'voice',
        transcript: 'Chat la ap fòse pou l pipi',
        symptoms: ['ne_peut_pas_uriner'],
        answers: { q_douleur: 'wi', q_sang: 'mpakonnen' },
      },
      T0 + 1000,
    );
    const a = getAssessment(db, id)!;
    expect(a.species).toBe('chat');
    expect(a.symptoms).toEqual(['ne_peut_pas_uriner']);
    expect(a.answers).toEqual({ q_douleur: 'wi', q_sang: 'mpakonnen' });
    expect(a.updatedAt).toBe(T0 + 1000);
    expect(a.createdAt).toBe(T0);
  });

  it('ignore les champs undefined d’un patch (ne les efface pas)', () => {
    const db = freshDb();
    const { id } = createAssessment(db, { lang: 'ht' }, T0);
    updateAssessment(db, id, { species: 'chien' }, T0);
    updateAssessment(db, id, { species: undefined, age: 'jenn' }, T0);
    expect(getAssessment(db, id)).toMatchObject({ species: 'chien', age: 'jenn' });
  });

  it('refuse un niveau inconnu (contrainte SQL)', () => {
    const db = freshDb();
    const { id } = createAssessment(db, { lang: 'ht' }, T0);
    // @ts-expect-error niveau invalide volontaire
    expect(() => updateAssessment(db, id, { level: 'grave' }, T0)).toThrow();
  });

  it('l’historique ne liste que les évaluations terminées, les plus récentes d’abord', () => {
    const db = freshDb();
    const a = createAssessment(db, { lang: 'ht' }, T0);
    const b = createAssessment(db, { lang: 'ht' }, T0 + 1);
    createAssessment(db, { lang: 'ht' }, T0 + 2); // reste en cours
    updateAssessment(db, a.id, { status: 'done', level: 'siveye' }, T0 + 10);
    updateAssessment(db, b.id, { status: 'done', level: 'ijans' }, T0 + 20);
    expect(listDoneAssessments(db).map((x) => x.id)).toEqual([b.id, a.id]);
  });
});

describe('reprise', () => {
  it('propose la dernière évaluation en cours de moins de 24 h', () => {
    const db = freshDb();
    createAssessment(db, { lang: 'ht' }, T0);
    const recent = createAssessment(db, { lang: 'ht' }, T0 + 5000);
    expect(findResumable(db, T0 + 10_000)?.id).toBe(recent.id);
  });

  it('ne propose pas une évaluation trop ancienne, terminée ou abandonnée', () => {
    const db = freshDb();
    createAssessment(db, { lang: 'ht' }, T0);
    expect(findResumable(db, T0 + RESUME_WINDOW_MS + 1)).toBeNull();

    const db2 = freshDb();
    const done = createAssessment(db2, { lang: 'ht' }, T0);
    updateAssessment(db2, done.id, { status: 'done', level: 'konsilte' }, T0);
    expect(findResumable(db2, T0 + 1)).toBeNull();

    const db3 = freshDb();
    createAssessment(db3, { lang: 'ht' }, T0);
    expect(abandonInProgress(db3, T0 + 1)).toBe(1);
    expect(findResumable(db3, T0 + 2)).toBeNull();
  });
});

describe('effacement', () => {
  it('efface toutes les évaluations', () => {
    const db = freshDb();
    createAssessment(db, { lang: 'ht' }, T0);
    createAssessment(db, { lang: 'ht' }, T0);
    expect(deleteAllAssessments(db)).toBe(2);
    expect(listDoneAssessments(db)).toEqual([]);
    expect(findResumable(db, T0)).toBeNull();
  });
});
