import advice from '../../content/consignes.json';
import type { Question, Rule, Symptom, TriageContent } from './content-types';
import {
  ALWAYS_ADVICE_IDS,
  createEvaluate,
  CAP_RULE_ID,
  MAX_FOLLOWUP_QUESTIONS,
  maxLevel,
  RETURN_ADVICE_IDS,
} from './engine';
import { evaluate, triageContent } from './index';
import type { Answer, Evaluate, Species, TriageInput, TriageOutput } from './types';

const base: Omit<TriageInput, 'species'> = { age: 'adilt', symptoms: [], answers: {} };

/**
 * Répond aux questions jusqu'au résultat, comme le ferait l'écran E23.
 * `reply` donne la réponse à chaque question (par défaut « non »).
 */
function runToEnd(
  input: TriageInput,
  reply: (questionId: string) => Answer = () => 'non',
  ev: Evaluate = evaluate,
): TriageOutput & { asked: string[] } {
  const answers = { ...input.answers };
  const asked: string[] = [];
  let out = ev({ ...input, answers });
  while (out.nextQuestionId) {
    expect(asked).not.toContain(out.nextQuestionId); // jamais deux fois la même question
    asked.push(out.nextQuestionId);
    answers[out.nextQuestionId] = reply(out.nextQuestionId);
    out = ev({ ...input, answers });
  }
  return { ...out, asked };
}

/**
 * Liste figée des signes d'alerte (symptomes.csv, 14 nov.).
 * Retirer un signe d'alerte du contenu doit faire échouer ce test : c'est voulu.
 */
const ALERT_IDS = [
  'difficulte_respirer', 'respiration_bouche_ouverte_chat', 'gencives_pales_bleues',
  'effondrement_inconscient', 'incapable_se_lever', 'convulsions', 'tremblements_actifs',
  'ne_peut_pas_uriner', 'efforts_vomir_sans_resultat', 'ventre_gonfle_douloureux', 'vomit_sang',
  'diarrhee_sang', 'vomissements_repetes', 'saignement_important', 'plaie_profonde_os',
  'accident_chute', 'brulure_grave', 'coup_chaleur', 'mise_bas_difficile', 'organe_sorti',
  'etouffement', 'gonflement_visage_piqure', 'oeil_sorti', 'ingestion_toxique',
  'medicament_humain_donne', 'signes_rage', 'chiot_vomit_diarrhee',
];

const alertSymptoms = triageContent.symptoms.filter((s) => s.alert);
const alertCases = alertSymptoms.flatMap((s) => s.species.map((sp) => [s.id, sp] as [string, Species]));
const adviceIds = new Set(advice.map((a) => a.id));

describe('contenu du moteur', () => {
  it('contient tous les signes d’alerte de la liste figée', () => {
    const alertIds = new Set(alertSymptoms.map((s) => s.id));
    for (const id of ALERT_IDS) expect(alertIds).toContain(id);
  });

  it('a une règle alerte_ → ijans pour chaque signe d’alerte', () => {
    for (const s of alertSymptoms) {
      const rule = triageContent.rules.find((r) => r.id === `alerte_${s.id}`);
      expect(rule).toMatchObject({ level: 'ijans', when: [{ sym: s.id }] });
    }
  });

  it('chaque signe d’alerte a une question qui le demande', () => {
    const asked = new Set(triageContent.questions.map((q) => q.symptomId));
    for (const s of alertSymptoms) expect(asked).toContain(s.id);
  });

  it('référence des consignes fixes qui existent', () => {
    for (const id of [...ALWAYS_ADVICE_IDS, ...RETURN_ADVICE_IDS]) expect(adviceIds).toContain(id);
  });

  it('les questions de base tiennent dans le plafond', () => {
    for (const species of ['chien', 'chat'] as Species[]) {
      const always = triageContent.questions.filter(
        (q) => q.always && (!q.species || q.species.includes(species)),
      );
      expect(always.length).toBeLessThanOrEqual(5);
    }
  });
});

describe('signes d’alerte', () => {
  it.each(alertCases)('%s confirmé chez le %s → ijans, sans question', (id, species) => {
    const out = evaluate({ ...base, species, symptoms: [id] });
    expect(out.level).toBe('ijans');
    expect(out.nextQuestionId).toBeNull();
    expect(out.reasons).toContain(`alerte_${id}`);
    expect(out.adviceIds).toEqual(expect.arrayContaining(['urg_aller_vite', ...ALWAYS_ADVICE_IDS]));
    expect(out.adviceIds).not.toContain('ret_general');
  });

  it.each(alertCases)('question sur %s répondue « wi » chez le %s → ijans', (id, species) => {
    const out = evaluate({ ...base, species, answers: { [`q_${id}`]: 'wi' } });
    expect(out.level).toBe('ijans');
    expect(out.reasons).toContain(`alerte_${id}`);
  });

  it('un signe d’alerte l’emporte sur des symptômes bénins', () => {
    const out = evaluate({ ...base, species: 'chien', symptoms: ['grattage_intense', 'toux', 'convulsions'] });
    expect(out.level).toBe('ijans');
    expect(out.reasons[0]).toBe('alerte_convulsions');
  });

  it('chiot qui vomit et a la diarrhée → ijans (règle à valider)', () => {
    const out = evaluate({ ...base, species: 'chien', age: 'jenn', symptoms: ['vomissements', 'diarrhee'] });
    expect(out.level).toBe('ijans');
    expect(out.reasons).toContain('r_chiot_vomit_et_diarrhee');
  });
});

describe('parcours de questions (vrai contenu)', () => {
  it('pose les questions de base, sans doublon, puis conclut', () => {
    const out = runToEnd({ ...base, species: 'chien' });
    expect(out.asked).toEqual(['q_difficulte_respirer', 'q_effondrement_inconscient', 'q_ingestion_toxique']);
    expect(out.level).toBe('siveye');
  });

  it('chat mâle : demande toujours s’il arrive à uriner', () => {
    const out = runToEnd({ ...base, species: 'chat', sex: 'male' });
    expect(out.asked).toContain('q_chat_male_uriner');
    expect(runToEnd({ ...base, species: 'chat', sex: 'femelle' }).asked).not.toContain('q_chat_male_uriner');
  });

  it('chat mâle : « m pa konnen » sur l’urine → ijans', () => {
    const out = runToEnd({ ...base, species: 'chat', sex: 'male' }, (q) =>
      q === 'q_chat_male_uriner' ? 'mpakonnen' : 'non',
    );
    expect(out.level).toBe('ijans');
    expect(out.reasons).toContain('prudence_chat_male_uriner');
  });

  it('ne repose pas la question urinaire du chat mâle après la litière', () => {
    const out = runToEnd({ ...base, species: 'chat', sex: 'male', symptoms: ['changement_litiere_chat'] });
    const urine = out.asked.filter((q) => q === 'q_chat_male_uriner' || q === 'q_ne_peut_pas_uriner');
    expect(urine).toHaveLength(1);
    expect(out.level).toBe('konsilte');
    expect(out.adviceIds).toContain('ret_chat_urine');
  });

  it('vomissements : pose les questions d’alerte avant la durée', () => {
    const out = runToEnd({ ...base, species: 'chien', symptoms: ['vomissements'] });
    expect(out.asked.indexOf('q_vomit_sang')).toBeLessThan(out.asked.indexOf('q_vomit_plus_24h'));
    expect(out.asked.indexOf('q_difficulte_respirer')).toBeLessThan(out.asked.indexOf('q_vomit_plus_24h'));
    expect(out.level).toBe('siveye');
    expect(out.adviceIds).toEqual(expect.arrayContaining(['ret_vomit_diarrhee', 'ret_general']));
  });

  it('vomissements depuis plus de 24 h → konsilte', () => {
    const out = runToEnd({ ...base, species: 'chien', symptoms: ['vomissements'] }, (q) =>
      q === 'q_vomit_plus_24h' ? 'wi' : 'non',
    );
    expect(out).toMatchObject({ level: 'konsilte' });
    expect(out.reasons).toContain('r_vomit_plus_24h');
  });

  it('pose les questions de durée propres à l’espèce', () => {
    const chat = runToEnd({ ...base, species: 'chat', symptoms: ['ne_mange_plus'] });
    const chien = runToEnd({ ...base, species: 'chien', symptoms: ['ne_mange_plus'] });
    expect(chat.asked).toContain('q_chat_jeun_24h');
    expect(chat.asked).not.toContain('q_chien_jeun_48h');
    expect(chien.asked).toContain('q_chien_jeun_48h');
  });

  /** Questions d'alerte qu'un parcours devrait poser : base + déclenchées par les symptômes */
  const expectedAlertQuestions = (input: TriageInput) =>
    triageContent.questions
      .filter(
        (q) =>
          q.kind === 'alerte' &&
          (!q.species || q.species.includes(input.species)) &&
          (!q.sex || input.sex === undefined || q.sex === input.sex) &&
          (!q.age || q.age.includes(input.age)) &&
          (q.always || q.askedIf.some((s) => input.symptoms.includes(s))),
      )
      .map((q) => q.symptomId);

  it.each([
    ['chat mâle, 7 symptômes', { ...base, species: 'chat', sex: 'male', symptoms: ['vomissements', 'diarrhee', 'ne_mange_plus', 'toux', 'boiterie', 'plaie_petite', 'probleme_oreille'] }],
    ['chien, 5 symptômes', { ...base, species: 'chien', symptoms: ['vomissements', 'diarrhee', 'signes_douleur', 'plaie_petite', 'boiterie'] }],
    ['chatte, 3 symptômes digestifs', { ...base, species: 'chat', sex: 'femelle', symptoms: ['vomissements', 'diarrhee', 'ne_mange_plus'] }],
  ] as [string, TriageInput][])('%s : toutes les questions d’alerte sont posées', (_name, input) => {
    const out = runToEnd(input);
    const askedSymptoms = out.asked.map((id) => triageContent.questions.find((q) => q.id === id)!.symptomId);
    for (const s of expectedAlertQuestions(input)) expect(askedSymptoms).toContain(s);
    expect(out.level).not.toBeNull();
  });

  it('chatte qui vomit, a la diarrhée et ne mange plus : durées et aggravation posées', () => {
    const out = runToEnd({ ...base, species: 'chat', sex: 'femelle', symptoms: ['vomissements', 'diarrhee', 'ne_mange_plus'] });
    expect(out.asked).toEqual(expect.arrayContaining(['q_chat_jeun_24h', 'q_diarrhee_plus_48h', 'q_aggravation']));
    expect(out.reasons).not.toContain(CAP_RULE_ID);
  });

  it('ajouter un symptôme ne retire jamais une question d’alerte', () => {
    const benign = triageContent.symptoms.filter((s) => !s.alert && s.species.includes('chien')).map((s) => s.id);
    const alertAsked = (symptoms: string[]) =>
      new Set(
        runToEnd({ ...base, species: 'chien', symptoms })
          .asked.map((id) => triageContent.questions.find((q) => q.id === id)!)
          .filter((q) => q.kind === 'alerte')
          .map((q) => q.symptomId),
      );
    const chosen: string[] = [];
    let previous = alertAsked([]);
    for (const id of benign) {
      chosen.push(id);
      const current = alertAsked([...chosen]);
      for (const s of previous) expect(current).toContain(s);
      previous = current;
    }
  });

  it.each(
    triageContent.questions
      .filter((q) => q.kind === 'alerte')
      .flatMap((q) => (q.species ?? ['chien', 'chat']).map((sp) => [q.id, sp] as [string, Species])),
  )('« m pa konnen » à %s (%s) → au moins konsilte', (qid, species) => {
    const out = runToEnd({ ...base, species, answers: { [qid]: 'mpakonnen' } });
    expect(['konsilte', 'ijans']).toContain(out.level);
  });

  it('chat de sexe inconnu : la question sur l’urine est posée', () => {
    const out = runToEnd({ ...base, species: 'chat' });
    expect(out.asked).toContain('q_chat_male_uriner');
    const doubt = runToEnd({ ...base, species: 'chat' }, (q) => (q === 'q_chat_male_uriner' ? 'mpakonnen' : 'non'));
    expect(doubt.level).toBe('ijans');
  });

  it('un « wi » d’alerte compte même si la question n’est plus éligible', () => {
    const out = evaluate({ ...base, species: 'chat', sex: 'femelle', answers: { q_chat_male_uriner: 'wi' } });
    expect(out.level).toBe('ijans');
  });

  it('l’IA qui propose ijans arrête les questions', () => {
    const out = evaluate({ ...base, species: 'chien', symptoms: ['toux'], modelLevel: 'ijans' });
    expect(out).toMatchObject({ level: 'ijans', nextQuestionId: null });
  });

  it('chiot qui vomit : demande la diarrhée, et « wi » → ijans', () => {
    const out = runToEnd({ ...base, species: 'chien', age: 'jenn', symptoms: ['vomissements'] }, (q) =>
      q === 'q_diarrhee' ? 'wi' : 'non',
    );
    expect(out.asked).toContain('q_diarrhee');
    expect(out.level).toBe('ijans');
    expect(runToEnd({ ...base, species: 'chien', symptoms: ['vomissements'] }).asked).not.toContain('q_diarrhee');
  });

  it('refuse une espèce ou un âge invalide au lieu de répondre siveye', () => {
    expect(() => evaluate({ ...base, species: 'chen' as Species })).toThrow(/Espèce/);
    expect(() => evaluate({ ...base, species: 'chien', age: 'adulte' as TriageInput['age'] })).toThrow(/Âge/);
  });

  it('toutes les consignes renvoyées existent', () => {
    for (const s of triageContent.symptoms) {
      for (const sp of s.species) {
        const out = runToEnd({ ...base, species: sp, symptoms: [s.id] }, () => 'wi');
        for (const id of out.adviceIds) expect(adviceIds).toContain(id);
      }
    }
  });
});

describe('entrées à ignorer', () => {
  it('ignore un symptôme propre à une autre espèce', () => {
    const out = runToEnd({ ...base, species: 'chien', symptoms: ['respiration_bouche_ouverte_chat'] });
    expect(out.level).toBe('siveye');
    expect(out.reasons).toEqual([]);
  });

  it('ignore un identifiant inconnu sans erreur', () => {
    const out = evaluate({ ...base, species: 'chat', symptoms: ['inconnu'], answers: { q_inconnue: 'wi' } });
    expect(out.progress.asked).toBe(0);
    expect(runToEnd({ ...base, species: 'chat', symptoms: ['inconnu'] }).level).toBe('siveye');
  });
});

describe('niveau final', () => {
  it('aucun symptôme → siveye avec les consignes générales', () => {
    const out = runToEnd({ ...base, species: 'chat' });
    expect(out).toMatchObject({ level: 'siveye', nextQuestionId: null });
    expect(out.adviceIds).toEqual([...RETURN_ADVICE_IDS, ...ALWAYS_ADVICE_IDS]);
  });

  it('applique le niveau minimal d’un symptôme non alarmant', () => {
    expect(runToEnd({ ...base, species: 'chat', symptoms: ['abattu_se_cache'] }).level).toBe('konsilte');
    expect(runToEnd({ ...base, species: 'chat', symptoms: ['puces_tiques'] }).level).toBe('siveye');
  });

  it('« m pa konnen » sur un signe d’alerte → niveau de prudence', () => {
    const out = runToEnd({ ...base, species: 'chien' }, (q) => (q === 'q_difficulte_respirer' ? 'mpakonnen' : 'non'));
    expect(out.level).toBe('konsilte');
    expect(out.reasons).toEqual(['prudence_difficulte_respirer']);
  });

  it('le modèle peut relever le niveau', () => {
    expect(runToEnd({ ...base, species: 'chien', symptoms: ['toux'], modelLevel: 'konsilte' }).level).toBe('konsilte');
  });

  it('le modèle ne peut jamais abaisser le niveau', () => {
    const out = evaluate({ ...base, species: 'chien', symptoms: ['convulsions'], modelLevel: 'siveye' });
    expect(out.level).toBe('ijans');
  });

  it('ajouter un symptôme ne fait jamais baisser le niveau (monotonie)', () => {
    const ids = triageContent.symptoms.filter((s) => s.species.includes('chat')).map((s) => s.id);
    let previous = runToEnd({ ...base, species: 'chat' }).level!;
    const chosen: string[] = [];
    for (const id of ids) {
      chosen.push(id);
      const level = runToEnd({ ...base, species: 'chat', symptoms: [...chosen] }).level!;
      expect(maxLevel(previous, level)).toBe(level);
      previous = level;
    }
  });

  it('est déterministe et n’altère pas l’entrée', () => {
    const input: TriageInput = { ...base, species: 'chat', symptoms: ['vomissements', 'toux'], answers: {} };
    const copy = structuredClone(input);
    expect(evaluate(input)).toEqual(evaluate(input));
    expect(input).toEqual(copy);
  });

  it('indique la version des règles', () => {
    expect(evaluate({ ...base, species: 'chien' }).rulesVersion).toBe(triageContent.rulesVersion);
  });
});

// Mécanique du choix des questions, sur un contenu synthétique
describe('choix des questions (contenu synthétique)', () => {
  const sym = (id: string, alert: boolean): Symptom => ({
    id,
    category: 'test',
    species: ['chien', 'chat'],
    label: id,
    alert,
    minLevel: alert ? 'ijans' : 'siveye',
    questionId: `q_${id}`,
    status: 'brouillon',
  });
  const q = (id: string, extra: Partial<Question>): Question => ({
    id: `q_${id}`,
    kind: 'alerte',
    text: id,
    symptomId: id,
    askedIf: [],
    always: false,
    priority: 100,
    levelIfUnknown: 'konsilte',
    status: 'brouillon',
    ...extra,
  });
  const alertRule = (id: string): Rule => ({
    id: `alerte_${id}`,
    when: [{ sym: id }],
    level: 'ijans',
    reason: id,
    adviceIds: [],
    source: 'test',
    status: 'brouillon',
  });

  const content: TriageContent = {
    symptoms: [sym('vomissements', false), sym('vomit_sang', true), sym('respire', true), sym('uriner', true)],
    questions: [
      q('vomit_sang', { askedIf: ['vomissements'], priority: 5 }),
      q('respire', { always: true, priority: 10 }),
      q('uriner', { always: true, priority: 20, species: ['chat'], sex: 'male' }),
    ],
    rules: [alertRule('vomit_sang'), alertRule('respire'), alertRule('uriner')],
    rulesVersion: 'test',
  };
  const ev = createEvaluate(content);

  it('suit la priorité du tableur', () => {
    expect(ev({ ...base, species: 'chien', symptoms: ['vomissements'] })).toMatchObject({
      level: null,
      nextQuestionId: 'q_vomit_sang',
    });
    expect(ev({ ...base, species: 'chien' }).nextQuestionId).toBe('q_respire');
  });

  it('compte les questions posées et restantes', () => {
    const out = ev({ ...base, species: 'chien', symptoms: ['vomissements'], answers: { q_vomit_sang: 'non' } });
    expect(out.nextQuestionId).toBe('q_respire');
    expect(out.progress).toEqual({ asked: 1, max: 2 });
  });

  it('filtre par espèce et sexe', () => {
    const answers = { q_respire: 'non' } as const;
    expect(ev({ ...base, species: 'chien', answers }).nextQuestionId).toBeNull();
    expect(ev({ ...base, species: 'chat', sex: 'femelle', answers }).nextQuestionId).toBeNull();
    expect(ev({ ...base, species: 'chat', sex: 'male', answers }).nextQuestionId).toBe('q_uriner');
  });

  it('s’arrête dès qu’une réponse donne ijans', () => {
    const out = ev({ ...base, species: 'chat', sex: 'male', answers: { q_respire: 'wi' } });
    expect(out).toMatchObject({ level: 'ijans', nextQuestionId: null });
  });

  it('ne pose pas une question dont le symptôme est déjà confirmé', () => {
    const out = runToEnd({ ...base, species: 'chien', symptoms: ['respire'] }, () => 'non', ev);
    expect(out.asked).toEqual([]);
  });

  it('plafonne les questions de suivi et relève alors le niveau à konsilte', () => {
    const many: TriageContent = {
      ...content,
      symptoms: Array.from({ length: 15 }, (_, i) => sym(`s${i}`, false)),
      questions: Array.from({ length: 15 }, (_, i) => q(`s${i}`, { kind: 'duree', always: true, priority: 300 + i })),
      rules: [],
    };
    const out = runToEnd({ ...base, species: 'chien' }, () => 'non', createEvaluate(many));
    expect(out.asked).toHaveLength(MAX_FOLLOWUP_QUESTIONS);
    expect(out.level).toBe('konsilte');
    expect(out.reasons).toEqual([CAP_RULE_ID]);
  });

  it('ne plafonne jamais les questions d’alerte', () => {
    const many: TriageContent = {
      ...content,
      symptoms: Array.from({ length: 25 }, (_, i) => sym(`a${i}`, true)),
      questions: [
        ...Array.from({ length: 15 }, (_, i) => q(`f${i}`, { kind: 'duree', symptomId: undefined, always: true, priority: 300 + i })),
        ...Array.from({ length: 25 }, (_, i) => q(`a${i}`, { always: true, priority: 100 + i })),
      ],
      rules: [],
    };
    const out = runToEnd({ ...base, species: 'chien' }, () => 'non', createEvaluate(many));
    expect(out.asked.filter((id) => id.startsWith('q_a'))).toHaveLength(25);
    expect(out.asked.filter((id) => id.startsWith('q_f'))).toHaveLength(MAX_FOLLOWUP_QUESTIONS);
  });
});
