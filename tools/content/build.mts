/// <reference types="node" />

/**
 * Conversion des tableurs content-sources/*.csv → content/*.json (+ tests/cas/*.json).
 * Lancement : `npm run content` (Node ≥ 23.6 exécute le TypeScript directement).
 *
 * Le script échoue (code 1) si le contenu est incohérent : id en double, référence cassée,
 * texte vide, niveau, espèce ou condition invalide. Le JSON généré est commité et ne se modifie
 * jamais à la main.
 *
 * Règles générées (jamais écrites à la main, pour qu'aucun oubli ne soit possible) :
 * - alerte_<symptôme>  : signe d'alerte confirmé ou répondu « wi » → ijans ;
 * - prudence_<question> : « m pa konnen » → niveau_si_mpakonnen (si plus haut que siveye) ;
 * - min_<symptôme>     : symptôme non alarmant → niveau_min.
 * Les autres règles (durée, âge, combinaisons) viennent de regles.csv.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  Advice,
  AdviceType,
  Clip,
  Condition,
  ContentVersion,
  LexiconEntry,
  Question,
  QuestionKind,
  Rule,
  Status,
  Symptom,
  TestCase,
  Toxic,
} from '../../src/triage/content-types';
import type { AgeGroup, Answer, Level, Species } from '../../src/triage/types';

const RULES_VERSION = '0.5.0';

/** ≈ 15 s de lecture à voix haute, à un débit lent (2,5 mots / s) */
const MAX_CLIP_WORDS = 35;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = join(ROOT, 'content-sources');
const OUT = join(ROOT, 'content');
const OUT_TESTS = join(ROOT, 'tests', 'cas');

const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

// ---------- CSV ----------

type Row = Record<string, string> & { __line: string };

/** CSV `;` avec guillemets doubles (RFC 4180), BOM retiré. */
function parseCsv(file: string): Row[] {
  const raw = readFileSync(join(SRC, file), 'utf8').replace(/^﻿/, '');
  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let quoted = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (quoted) {
      if (c === '"' && raw[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === ';') {
      record.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && raw[i + 1] === '\n') i++;
      record.push(field);
      field = '';
      if (record.some((f) => f !== '')) records.push(record);
      record = [];
    } else field += c;
  }
  record.push(field);
  if (record.some((f) => f !== '')) records.push(record);

  const [header, ...lines] = records;
  return lines.map((cells, i) => {
    if (cells.length !== header.length) {
      fail(`${file}:${i + 2} : ${cells.length} colonnes au lieu de ${header.length}`);
    }
    const row = { __line: `${file}:${i + 2}` } as Row;
    header.forEach((h, j) => (row[h.trim()] = (cells[j] ?? '').trim()));
    return row;
  });
}

// ---------- Valeurs ----------

const LEVELS: Level[] = ['ijans', 'konsilte', 'siveye'];
const RANK: Record<Level, number> = { siveye: 0, konsilte: 1, ijans: 2 };
const SPECIES: Species[] = ['chien', 'chat'];
const AGES: AgeGroup[] = ['jenn', 'adilt', 'granmoun'];
const ANSWERS: Answer[] = ['wi', 'non', 'mpakonnen'];

/** Valeurs du jeu de cas (créole, français) → valeurs du moteur */
const SPECIES_ALIASES: Record<string, Species> = { chien: 'chien', chen: 'chien', chyen: 'chien', chat: 'chat' };
const AGE_ALIASES: Record<string, AgeGroup> = {
  jenn: 'jenn', chiot: 'jenn', chaton: 'jenn', jeune: 'jenn',
  adilt: 'adilt', adulte: 'adilt',
  granmoun: 'granmoun', senior: 'granmoun', age: 'granmoun',
};

function level(row: Row, col: string): Level {
  const v = row[col] as Level;
  if (!LEVELS.includes(v)) fail(`${row.__line} : niveau « ${row[col]} » invalide (${col})`);
  return v;
}

function status(row: Row): Status {
  const v = row.statut.normalize('NFC');
  if (v === 'brouillon' || v === 'relu_ht') return v;
  if (v === 'validé' || v === 'valide') return 'valide';
  fail(`${row.__line} : statut « ${row.statut} » invalide`);
  return 'brouillon';
}

function list(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function species(row: Row, col = 'especes'): Species[] {
  const values = list(row[col]);
  for (const v of values) {
    if (!SPECIES.includes(v as Species)) fail(`${row.__line} : espèce « ${v} » invalide`);
  }
  return values as Species[];
}

function yesNo(row: Row, col: string): boolean {
  if (row[col] !== 'oui' && row[col] !== 'non') fail(`${row.__line} : ${col} doit valoir oui ou non`);
  return row[col] === 'oui';
}

/** Textes affichés : créole haïtien uniquement */
function text(row: Row, col: string): string {
  if (!row[col]) fail(`${row.__line} : texte vide (${col})`);
  return row[col];
}

function uniqueIds(file: string, items: { id: string }[]) {
  const seen = new Set<string>();
  for (const { id } of items) {
    if (!/^[a-z0-9_]+$/.test(id)) fail(`${file} : id « ${id} » n'est pas en snake_case`);
    if (seen.has(id)) fail(`${file} : id « ${id} » en double`);
    seen.add(id);
  }
}

/**
 * Conditions de regles.csv : `sym:x & rep:q_x=wi & espece:chat & sexe:male & age:jenn`.
 * Seulement le ET (`&`) : pour un OU, écrire deux règles.
 */
function parseConditions(row: Row): Condition[] {
  return row.conditions.split('&').map((part) => {
    const [key, ...rest] = part.trim().split(':');
    const value = rest.join(':').trim();
    switch (key.trim()) {
      case 'sym':
        return { sym: value };
      case 'rep': {
        const [q, answer] = value.split('=');
        if (!ANSWERS.includes(answer as Answer)) fail(`${row.__line} : réponse « ${answer} » invalide`);
        return { rep: q, value: answer as Answer };
      }
      case 'espece':
        if (!SPECIES.includes(value as Species)) fail(`${row.__line} : espèce « ${value} » invalide`);
        return { species: value as Species };
      case 'sexe':
        if (value !== 'male' && value !== 'femelle') fail(`${row.__line} : sexe « ${value} » invalide`);
        return { sex: value as 'male' | 'femelle' };
      case 'age':
        if (!AGES.includes(value as AgeGroup)) fail(`${row.__line} : âge « ${value} » invalide`);
        return { age: value as AgeGroup };
      default:
        fail(`${row.__line} : condition « ${part.trim()} » illisible`);
        return { sym: '' };
    }
  });
}

// ---------- Symptômes ----------

const symptoms: Symptom[] = parseCsv('symptomes.csv').map((r) => {
  const s: Symptom = {
    id: r.id,
    category: r.categorie,
    species: species(r),
    label: text(r, 'libelle_ht'),
    // « à valider » est traité comme un signe d'alerte (prudence) tant que le vétérinaire n'a pas tranché
    alert: r.signe_alerte !== 'non',
    minLevel: level(r, 'niveau_min'),
    questionId: `q_${r.id}`,
    status: status(r),
  };
  if (s.species.length === 0) fail(`${r.__line} : aucune espèce`);
  if (s.alert && s.minLevel !== 'ijans') fail(`${r.__line} : signe d'alerte mais niveau_min = ${s.minLevel}`);
  return s;
});

// ---------- Questions ----------

const KINDS: QuestionKind[] = ['alerte', 'duree', 'evolution', 'contexte'];

const questions: Question[] = parseCsv('questions.csv').map((r) => {
  if (!KINDS.includes(r.type as QuestionKind)) fail(`${r.__line} : type « ${r.type} » invalide`);
  const priority = Number(r.priorite);
  if (!Number.isInteger(priority)) fail(`${r.__line} : priorité « ${r.priorite} » invalide`);
  const sex = r.sexe || undefined;
  if (sex && sex !== 'male' && sex !== 'femelle') fail(`${r.__line} : sexe « ${sex} » invalide`);
  const ages = list(r.age);
  for (const a of ages) if (!AGES.includes(a as AgeGroup)) fail(`${r.__line} : âge « ${a} » invalide`);
  const sp = species(r);
  const q: Question = {
    id: r.id,
    kind: r.type as QuestionKind,
    text: text(r, 'question_ht'),
    askedIf: list(r.declenchee_par),
    always: yesNo(r, 'toujours'),
    priority,
    levelIfUnknown: level(r, 'niveau_si_mpakonnen'),
    status: status(r),
  };
  if (r.symptome_id) q.symptomId = r.symptome_id;
  if (sp.length > 0) q.species = sp;
  if (sex) q.sex = sex as 'male' | 'femelle';
  if (ages.length > 0) q.age = ages as AgeGroup[];
  return q;
});

// ---------- Consignes ----------

const ADVICE_TYPES: AdviceType[] = ['a_faire', 'a_ne_pas_faire', 'information', 'signe_retour'];

const advice: Advice[] = parseCsv('consignes.csv').map((r) => {
  if (!ADVICE_TYPES.includes(r.type as AdviceType)) fail(`${r.__line} : type « ${r.type} » invalide`);
  return {
    id: r.id,
    context: r.contexte,
    type: r.type as AdviceType,
    species: list(r.especes),
    text: text(r, 'texte_ht'),
    status: status(r),
  };
});

// ---------- Toxiques ----------

const toxics: Toxic[] = parseCsv('toxiques.csv').map((r) => ({
  id: r.id,
  category: r.categorie,
  name: text(r, 'nom_ht'),
  localNames: list(r.noms_locaux_a_completer),
  species: species(r),
  level: level(r, 'niveau'),
  message: text(r, 'message_ht'),
  status: status(r),
}));

// ---------- Lexique ----------

const lexicon: LexiconEntry[] = parseCsv('lexique.csv').map((r) => {
  if (!r.terme) fail(`${r.__line} : terme vide`);
  return {
    id: r.id,
    symptomId: r.symptome_id,
    term: r.terme,
    variants: list(r.variantes_normalisees),
    risky: r.note !== '' && /faux positif|risque|ambigu/i.test(r.note),
    status: status(r),
  };
});

// ---------- Règles ----------

/** Consignes des règles générées alerte_, selon la catégorie du symptôme */
const ADVICE_URGENCE = ['urg_aller_vite', 'urg_transport_calme'];
const ADVICE_BY_CATEGORY: Record<string, string[]> = {
  toxique: ['tox_noter_heure', 'tox_garder_emballage', 'tox_meme_sil_va_bien', 'tox_pas_faire_vomir', 'tox_pas_remede_maison'],
  trauma: ['plaie_appuyer', 'plaie_couvrir', 'plaie_pas_produit_fort'],
  environnement: ['chaleur_ombre'],
  neurologique: ['conv_eloigner_objets', 'conv_pas_main_gueule'],
  rage: ['rage_pas_toucher', 'rage_observer_animal'],
};
/** Consignes des règles générées min_ */
const ADVICE_BY_SYMPTOM: Record<string, string[]> = {
  plaie_petite: ['plaie_rincer', 'plaie_couvrir', 'plaie_pas_lecher', 'plaie_pas_produit_fort'],
  plaie_infectee: ['plaie_rincer', 'plaie_pas_lecher', 'plaie_pas_produit_fort', 'ret_plaie'],
  morsure_par_animal: ['plaie_morsure_vite', 'plaie_rincer', 'rage_observer_animal'],
  changement_litiere_chat: ['ret_chat_urine'],
  boiterie_sans_appui: ['boit_repos'],
};

const alertRules: Rule[] = symptoms
  .filter((s) => s.alert)
  .map((s) => ({
    id: `alerte_${s.id}`,
    when: [{ sym: s.id }],
    level: 'ijans',
    reason: s.label,
    adviceIds: [...ADVICE_URGENCE, ...(ADVICE_BY_CATEGORY[s.category] ?? [])],
    source: 'Généré : signe_alerte = oui (symptomes.csv)',
    status: s.status,
  }));

const symptomById = new Map(symptoms.map((s) => [s.id, s]));
const prudenceRules: Rule[] = questions
  .filter((q) => RANK[q.levelIfUnknown] > RANK.siveye)
  .map((q) => ({
    id: `prudence_${q.id.replace(/^q_/, '')}`,
    when: [{ rep: q.id, value: 'mpakonnen' }],
    level: q.levelIfUnknown,
    // On affiche la question restée sans réponse, pas le symptôme (que le propriétaire n'a pas confirmé)
    reason: `Ou pa konnen : ${q.text}`,
    adviceIds: q.levelIfUnknown === 'ijans' ? [...ADVICE_URGENCE] : ['gen_noter', 'ret_general'],
    source: 'Généré : « m pa konnen » (questions.csv, niveau_si_mpakonnen)',
    status: q.status,
  }));

const manualRules: Rule[] = parseCsv('regles.csv')
  .sort((a, b) => Number(a.priorite) - Number(b.priorite))
  .map((r) => ({
    id: r.id,
    when: parseConditions(r),
    level: level(r, 'niveau'),
    reason: text(r, 'raison_ht'),
    adviceIds: list(r.consignes),
    source: r.source,
    status: status(r),
  }));

const minRules: Rule[] = symptoms
  .filter((s) => !s.alert)
  .map((s) => ({
    id: `min_${s.id}`,
    when: [{ sym: s.id }],
    level: s.minLevel,
    reason: s.label,
    adviceIds: ADVICE_BY_SYMPTOM[s.id] ?? [],
    source: 'Généré : niveau_min (symptomes.csv)',
    status: s.status,
  }));

/** Ajoutée par le moteur (CAP_RULE_ID) quand le plafond a coupé des questions de suivi */
const capRule: Rule = {
  id: 'plafond_questions',
  when: [],
  level: 'konsilte',
  reason: 'Gen plizyè bagay ki rete pou verifye : fè yon veterinè egzamine l.',
  adviceIds: ['gen_noter'],
  source: 'Généré : plafond de questions (src/triage/engine.ts)',
  status: 'brouillon',
};

const rules: Rule[] = [...alertRules, ...prudenceRules, ...manualRules, ...minRules, capRule];

// ---------- Jeu de cas ----------

const cases: TestCase[] = parseCsv('cas_test.csv').map((r) => {
  const sp = SPECIES_ALIASES[r.espece];
  const age = AGE_ALIASES[r.age];
  if (!sp) fail(`${r.__line} : espèce « ${r.espece} » inconnue`);
  if (!age) fail(`${r.__line} : âge « ${r.age} » inconnu`);
  const answers: Record<string, Answer> = {};
  for (const pair of list(r.reponses)) {
    const [q, a] = pair.split('=');
    if (!ANSWERS.includes(a as Answer)) fail(`${r.__line} : réponse « ${pair} » invalide`);
    answers[q] = a as Answer;
  }
  return {
    id: r.id,
    species: sp,
    age,
    sex: r.sexe === 'male' || r.sexe === 'femelle' ? r.sexe : undefined,
    text: r.texte,
    expectedSymptoms: list(r.symptomes_attendus),
    expectedLevel: level(r, 'niveau_attendu'),
    kind: r.type_cas as TestCase['kind'],
    answers,
    note: r.note,
    status: status(r),
  };
});

const negativePhrases = parseCsv('banque_phrases.csv')
  .filter((r) => r.polarite === 'neg')
  .map((r) => ({ id: r.id, symptomId: r.symptome_id, text: r.phrase }));

// ---------- Clips audio ----------

const words = (t: string) => t.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length;

const screenClips: Clip[] = parseCsv('clips.csv').map((r) => {
  if (!/^E\d{2}$/.test(r.ecran)) fail(`${r.__line} : écran « ${r.ecran} » invalide (attendu E02, E30…)`);
  if (!/^clip_e\d{2}_/.test(r.id)) fail(`${r.__line} : un clip d'écran commence par clip_e<nn>_`);
  const src = r.source_contenu;
  if (src !== 'ecran' && !src.startsWith('i18n:')) fail(`${r.__line} : source_contenu doit valoir « ecran » ou « i18n:<clé> »`);
  const t = text(r, 'texte_ht');
  const c: Clip = { id: r.id, screen: r.ecran, text: t, words: words(t), status: status(r) };
  if (src.startsWith('i18n:')) c.i18nKey = src.slice(5);
  return c;
});

function contentClip(id: string, screen: string, ref: string, t: string, st: Status): Clip {
  return { id, screen, text: t, contentRef: ref, words: words(t), status: st };
}
const questionClips = questions.map((q) => {
  q.clipId = `clip_${q.id}`;
  return contentClip(q.clipId, 'E23', `questions:${q.id}`, q.text, q.status);
});
const adviceClips = advice.map((a) => {
  a.clipId = `clip_c_${a.id}`;
  return contentClip(a.clipId, a.context === 'rage' ? 'E40' : 'E31', `consignes:${a.id}`, a.text, a.status);
});
const toxicClips = toxics.map((t) => {
  t.clipId = `clip_t_${t.id}`;
  return contentClip(t.clipId, 'E41', `toxiques:${t.id}`, t.message, t.status);
});
const clips: Clip[] = [...screenClips, ...questionClips, ...adviceClips, ...toxicClips];

// ---------- Vérifications croisées ----------

uniqueIds('symptomes.csv', symptoms);
uniqueIds('questions.csv', questions);
uniqueIds('consignes.csv', advice);
uniqueIds('toxiques.csv', toxics);
uniqueIds('regles (générées + regles.csv)', rules);
uniqueIds('cas_test.csv', cases);
uniqueIds('clips (clips.csv + générés)', clips);
for (const c of clips) {
  if (c.words > MAX_CLIP_WORDS) fail(`clip ${c.id} : ${c.words} mots (> ${MAX_CLIP_WORDS}, plus de 15 s) — couper le texte`);
}

const adviceIds = new Set(advice.map((a) => a.id));
const symptomIds = new Set(symptoms.map((s) => s.id));
const questionIds = new Set(questions.map((q) => q.id));

for (const s of symptoms) {
  if (!questionIds.has(s.questionId)) fail(`symptôme ${s.id} : question « ${s.questionId} » absente de questions.csv`);
}
for (const q of questions) {
  if (q.symptomId && !symptomIds.has(q.symptomId)) fail(`question ${q.id} : symptôme « ${q.symptomId} » inconnu`);
  for (const s of q.askedIf) if (!symptomIds.has(s)) fail(`question ${q.id} : déclencheur « ${s} » inconnu`);
  if (!q.always && q.askedIf.length === 0 && q.kind !== 'alerte' && q.kind !== 'contexte') {
    fail(`question ${q.id} : ni toujours posée ni déclenchée, elle ne sera jamais posée`);
  }
  // Ordre de sûreté : questions de base < 100, questions d'alerte < 300, questions de suivi ≥ 300.
  // Le moteur ne plafonne que les questions de suivi : une question d'alerte ne doit jamais passer après elles.
  if (q.always && q.priority >= 100) fail(`question ${q.id} : question de base avec une priorité ≥ 100`);
  if (q.kind === 'alerte' && q.priority >= 300) fail(`question ${q.id} : question d'alerte avec une priorité ≥ 300`);
  if (q.kind !== 'alerte' && q.priority < 300) fail(`question ${q.id} : question de suivi avec une priorité < 300`);
}
for (const r of rules) {
  for (const a of r.adviceIds) if (!adviceIds.has(a)) fail(`règle ${r.id} : consigne « ${a} » inconnue`);
  for (const c of r.when) {
    if ('sym' in c && !symptomIds.has(c.sym)) fail(`règle ${r.id} : symptôme « ${c.sym} » inconnu`);
    if ('rep' in c && !questionIds.has(c.rep)) fail(`règle ${r.id} : question « ${c.rep} » inconnue`);
  }
}
for (const l of lexicon) {
  if (!symptomIds.has(l.symptomId)) fail(`lexique ${l.id} : symptôme « ${l.symptomId} » inconnu`);
}
for (const c of cases) {
  for (const s of c.expectedSymptoms) if (!symptomIds.has(s)) fail(`cas ${c.id} : symptôme « ${s} » inconnu`);
  for (const q of Object.keys(c.answers)) if (!questionIds.has(q)) fail(`cas ${c.id} : question « ${q} » inconnue`);
}

if (errors.length > 0) {
  console.error(`✗ ${errors.length} erreur(s) dans content-sources/ :`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

// ---------- Écriture ----------

function countByStatus(items: { status: Status }[]): Record<Status, number> {
  const c: Record<Status, number> = { brouillon: 0, relu_ht: 0, valide: 0 };
  for (const i of items) c[i.status]++;
  return c;
}

const files = {
  symptomes: symptoms,
  questions,
  regles: rules,
  consignes: advice,
  toxiques: toxics,
  lexique: lexicon,
  clips,
};

const version: ContentVersion = {
  rulesVersion: RULES_VERSION,
  generatedAt: new Date().toISOString().slice(0, 10),
  counts: Object.fromEntries(Object.entries(files).map(([k, v]) => [k, countByStatus(v)])),
};

const write = (dir: string, name: string, data: unknown) =>
  writeFileSync(join(dir, `${name}.json`), JSON.stringify(data, null, 2) + '\n', 'utf8');

mkdirSync(OUT, { recursive: true });
mkdirSync(OUT_TESTS, { recursive: true });
for (const [name, data] of Object.entries({ ...files, version })) write(OUT, name, data);
write(OUT_TESTS, 'cas', cases);
write(OUT_TESTS, 'phrases-niees', negativePhrases);

console.log(`✓ content/ généré (règles ${RULES_VERSION}) : ${rules.length} règles dont ${manualRules.length} écrites à la main`);
console.log(`✓ content/clips.json : ${clips.length} clips (${screenClips.length} d'écran, ${clips.length - screenClips.length} de contenu)`);
console.log(`✓ tests/cas/ : ${cases.length} cas, ${negativePhrases.length} phrases niées`);
console.table(version.counts);
