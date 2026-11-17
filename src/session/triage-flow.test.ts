import { detectSymptomsSimulated, normalize } from '../ai/simulation';
import { evaluate } from '../triage';
import { initialSymptomSelection, toTriageInput, withAnswer, withoutLastAnswer } from './triage-flow';

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

describe('normalisation', () => {
  it('enlève accents, majuscules et ponctuation', () => {
    expect(normalize('Chat la AP fòse, pou l pipi!')).toBe(' chat la ap fose pou l pipi ');
  });
});

describe('détection simulée (lexique)', () => {
  it('trouve un signe d’alerte dans un récit oral', () => {
    expect(detectSymptomsSimulated('Chat mwen an ap fòse pou l pipi men anyen pa soti depi maten', 'chat')).toContain(
      'ne_peut_pas_uriner',
    );
  });

  it('ne renvoie que des symptômes de l’espèce choisie', () => {
    const found = detectSymptomsSimulated('Chat la ap respire ak bouch li louvri, lang li deyò', 'chien');
    expect(found).not.toContain('respiration_bouche_ouverte_chat');
  });

  it('texte vide → aucun symptôme', () => {
    expect(detectSymptomsSimulated('   ', 'chien')).toEqual([]);
  });

  it('chaque symptôme n’apparaît qu’une fois', () => {
    const found = detectSymptomsSimulated('l ap vomi, l ap vomi ankò, l ap vomi san rete', 'chien');
    expect(new Set(found).size).toBe(found.length);
  });
});

describe('parcours E21 → E23', () => {
  it('pas d’entrée moteur tant que l’animal n’est pas décrit', () => {
    expect(toTriageInput({ ...base, species: 'chien' })).toBeNull();
    expect(toTriageInput({ ...base, species: 'chat', age: 'adilt', sex: 'male' })).toMatchObject({
      species: 'chat',
      age: 'adilt',
      sex: 'male',
    });
  });

  it('réponses : ajout, remplacement et retour à la question précédente', () => {
    let a = withAnswer({}, 'q1', 'non');
    a = withAnswer(a, 'q2', 'mpakonnen');
    a = withAnswer(a, 'q1', 'wi'); // re-réponse : passe en dernier
    expect(Object.keys(a)).toEqual(['q2', 'q1']);
    const back = withoutLastAnswer(a);
    expect(back.questionId).toBe('q1');
    expect(back.answers).toEqual({ q2: 'mpakonnen' });
    expect(withoutLastAnswer({})).toEqual({ answers: {}, questionId: null });
  });

  it('E22 : reprise → symptômes enregistrés ; sinon → détectés', () => {
    expect(initialSymptomSelection(['a'], ['b'])).toEqual(['a']);
    expect(initialSymptomSelection([], ['b'])).toEqual(['b']);
  });

  it('chaîne complète : un signe d’alerte détecté et confirmé donne ijans sans question', () => {
    const symptoms = detectSymptomsSimulated('Chat mwen an ap fòse pou l pipi men anyen pa soti', 'chat');
    const input = toTriageInput({ ...base, species: 'chat', age: 'adilt', sex: 'male', symptoms })!;
    const out = evaluate(input);
    expect(out.level).toBe('ijans');
    expect(out.nextQuestionId).toBeNull();
  });

  it('chaîne complète : sans symptôme, le moteur pose des questions puis conclut', () => {
    let answers = {};
    let out = evaluate({ species: 'chien', age: 'adilt', symptoms: [], answers });
    let guard = 0;
    while (out.nextQuestionId && guard++ < 100) {
      answers = withAnswer(answers, out.nextQuestionId, 'non');
      out = evaluate({ species: 'chien', age: 'adilt', symptoms: [], answers });
    }
    expect(out.nextQuestionId).toBeNull();
    expect(out.level).not.toBeNull();
  });
});
