import { createMemoryDb } from '../../tests/helpers/node-db';
import { getAssessment } from '../storage/assessments';
import { migrate } from '../storage/db';
import { createAssessmentSession, resumeRoute } from './assessment-session';

function setup(start = 1_763_100_000_000) {
  const db = createMemoryDb();
  migrate(db);
  let now = start;
  const session = createAssessmentSession(db, () => now);
  return { db, session, tick: (ms: number) => (now += ms) };
}

describe('session d’évaluation', () => {
  it('enregistre chaque étape dans la base (rien n’est perdu si l’app est tuée)', () => {
    const { db, session } = setup();
    const { id } = session.start('ht');
    session.update({ species: 'chien', age: 'adilt' });
    session.update({ transcript: 'L ap vomi depi ayè' });
    expect(getAssessment(db, id)).toMatchObject({ species: 'chien', age: 'adilt', transcript: 'L ap vomi depi ayè' });
  });

  it('reprend une évaluation interrompue après un redémarrage', () => {
    const { db, session } = setup();
    const { id } = session.start('fr');
    session.update({ species: 'chat', age: 'jenn' });

    // « Redémarrage » : nouvelle session sur la même base
    const restarted = createAssessmentSession(db, () => 1_763_100_060_000);
    const resumable = restarted.findResumable();
    expect(resumable?.id).toBe(id);
    expect(restarted.resume(id)).toMatchObject({ species: 'chat', age: 'jenn' });
    expect(restarted.getCurrent()?.id).toBe(id);
  });

  it('démarrer une nouvelle évaluation abandonne l’ancienne', () => {
    const { db, session, tick } = setup();
    const first = session.start('ht');
    tick(1000);
    const second = session.start('ht');
    expect(getAssessment(db, first.id)?.status).toBe('abandoned');
    expect(session.findResumable()?.id).toBe(second.id);
  });

  it('terminer enregistre le résultat du moteur et retire l’évaluation de la reprise', () => {
    const { db, session } = setup();
    const { id } = session.start('ht');
    session.finish({ level: 'ijans', reasons: ['r_alerte'], adviceIds: ['urgence_transport'], rulesVersion: '1.0.0' });
    expect(getAssessment(db, id)).toMatchObject({ status: 'done', level: 'ijans', reasons: ['r_alerte'] });
    expect(session.findResumable()).toBeNull();
  });

  it('refuse de modifier quand aucune évaluation n’est en cours', () => {
    const { session } = setup();
    expect(() => session.update({ species: 'chien' })).toThrow();
  });

  it('ne reprend pas une évaluation terminée', () => {
    const { session } = setup();
    const { id } = session.start('ht');
    session.finish({ level: 'siveye', reasons: [], adviceIds: [], rulesVersion: '1.0.0' });
    expect(session.resume(id)).toBeNull();
  });

  it('prévient les écrans à chaque changement', () => {
    const { session } = setup();
    const listener = jest.fn();
    const unsubscribe = session.subscribe(listener);
    session.start('ht');
    session.update({ species: 'chien' });
    unsubscribe();
    session.update({ age: 'adilt' });
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe('écran de reprise', () => {
  const base = {
    id: 'x',
    createdAt: 0,
    updatedAt: 0,
    status: 'in_progress' as const,
    lang: 'ht' as const,
    species: null,
    age: null,
    sex: null,
    inputMode: null,
    transcript: null,
    symptoms: [],
    answers: {},
    level: null,
    reasons: [],
    adviceIds: [],
    rulesVersion: null,
    photoUri: null,
  };

  it.each([
    ['rien de rempli', {}, '/animal'],
    ['animal choisi', { species: 'chien', age: 'adilt' }, '/description'],
    ['description faite', { species: 'chien', age: 'adilt', transcript: 'vomi' }, '/symptomes'],
    ['questions commencées', { species: 'chien', age: 'adilt', symptoms: ['vomit'], answers: { q1: 'wi' } }, '/questions'],
    ['niveau connu', { species: 'chien', age: 'adilt', level: 'siveye' }, '/resultat'],
  ] as const)('%s → %s', (_label, patch, route) => {
    expect(resumeRoute({ ...base, ...patch } as never)).toBe(route);
  });
});
