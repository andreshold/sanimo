/**
 * Contrôle des textes affichés (PLAN §8.1, feuille de route D3 §2.5) :
 * aucune dose ou quantité, aucun nom de maladie, aucun nom de médicament à donner.
 * Exception : le mot « rage / raj », titre du module E40.
 */

import advice from '../content/consignes.json';
import questions from '../content/questions.json';
import rules from '../content/regles.json';
import symptoms from '../content/symptomes.json';
import toxics from '../content/toxiques.json';

type Shown = { where: string; text: string };

function texts(file: string, items: { id: string }[], fields: string[]): Shown[] {
  return items.flatMap((item) =>
    fields.map((f) => ({ where: `${file}/${item.id}.${f}`, text: (item as unknown as Record<string, string>)[f] })),
  );
}

const medical: Shown[] = [
  ...texts('symptomes', symptoms, ['label']),
  ...texts('questions', questions, ['text']),
  ...texts('regles', rules, ['reason']),
  ...texts('consignes', advice, ['text']),
];
const toxicTexts = texts('toxiques', toxics, ['name', 'message']);

/** Chiffre suivi d'une unité de dose ou de quantité (formes créoles et emprunts au français) */
const DOSE =
  /\d+([.,]\d+)?\s*(mg|ml|g|kg|cc|ui|comprim[ée]s?|g[ée]lules?|grenn|gout(t?e)?s?|kiy[èe]|cuill[eè]res?|tablèt|pilil)(?![\p{L}])/iu;

/** Noms de maladies (créole, emprunts au français, abréviations cliniques) — à compléter */
const DISEASES = [
  'parvo', 'parvovirose', 'leptospirose', 'lèptospiwoz', 'gale', 'gal', 'maladie de carré', 'distemper',
  'flutd', 'gdv', 'torsion', 'diabète', 'dyabèt', 'insuffisance', 'cancer', 'kansè', 'tumeur', 'timè',
  'teigne', 'piroplasmose', 'babésiose', 'ehrlichiose', 'dirofilariose', 'toxoplasmose', 'panleucopénie',
  'typhus', 'coryza', 'calicivirus', 'fiv', 'felv', 'leishmaniose', 'pyomètre', 'glaucome', 'épilepsie',
  'epilepsi', 'hypoglycémie', 'pancréatite', 'gastro-entérite', 'gastroentérite', 'otite', 'conjonctivite',
];

/** Médicaments à donner : interdits partout sauf dans la liste des toxiques (qui dit quoi ne PAS donner) */
const MEDICINES = [
  'paracétamol', 'acétaminophène', 'ibuprofène', 'aspirine', 'amoxicilline', 'antibiotique', 'antibyotik',
  'métronidazole', 'ivermectine', 'tylenol', 'advil', 'doliprane', 'cortisone', 'prednisone',
  'parasetamòl', 'ibipwofèn', 'aspirin', 'amoksisilin', 'kòtizòn',
];

const word = (w: string) => new RegExp(`(?<![\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}])`, 'iu');

const find = (items: Shown[], words: string[]) =>
  items.flatMap(({ where, text }) => words.filter((w) => word(w).test(text)).map((w) => `${where} : « ${w} »`));

describe('contrôle des textes affichés', () => {
  it('aucune dose ni quantité', () => {
    const hits = [...medical, ...toxicTexts].filter(({ text }) => DOSE.test(text)).map((s) => `${s.where} : ${s.text}`);
    expect(hits).toEqual([]);
  });

  it('aucun nom de maladie (sauf « rage »)', () => {
    expect(find([...medical, ...toxicTexts], DISEASES)).toEqual([]);
  });

  it('aucun nom de médicament à donner (hors liste des toxiques)', () => {
    expect(find(medical, MEDICINES)).toEqual([]);
  });

  it('les détecteurs fonctionnent', () => {
    expect(DOSE.test('donnez 250 mg')).toBe(true);
    expect(DOSE.test('ba l 2 grenn')).toBe(true);
    expect(DOSE.test('depuis plus de 24 heures')).toBe(false);
    expect(find([{ where: 't', text: 'Il a la gale.' }], DISEASES)).toHaveLength(1);
    expect(find([{ where: 't', text: 'Crème anticancéreuse' }], DISEASES)).toHaveLength(0);
  });
});
