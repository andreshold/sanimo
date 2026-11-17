/**
 * SIMULATION de la détection des symptômes, en attendant le vrai module de D2
 * (src/ai/lexique.ts : normalisation complète, négations, « san », puis Makandal en union).
 *
 * Volontairement simple : recherche des termes du lexique dans le texte normalisé.
 * Ne gère PAS les négations (« li pa vomi ») : c'est l'utilisateur qui confirme sur E22.
 * Fichier distinct de lexique.ts pour ne pas activer les tests de D3 avec une version naïve.
 */
import lexicon from '../../content/lexique.json';
import symptoms from '../../content/symptomes.json';
import type { Species } from '../triage/types';

interface LexiconEntry {
  symptomId: string;
  term: string;
  variants: string[];
}

/** Minuscules, sans accents, apostrophes et ponctuation remplacées par des espaces */
export function normalize(text: string): string {
  return ` ${text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;
}

const speciesById = new Map((symptoms as { id: string; species: Species[] }[]).map((s) => [s.id, s.species]));

/** Termes normalisés par symptôme, préparés une seule fois */
const patterns: { symptomId: string; needle: string }[] = (lexicon as LexiconEntry[]).flatMap((e) =>
  [e.term, ...e.variants]
    .map((t) => normalize(t))
    .filter((n) => n.trim().length > 0)
    .map((needle) => ({ symptomId: e.symptomId, needle })),
);

/** Identifiants de symptômes trouvés dans le texte, pour l'espèce donnée, dans l'ordre du lexique */
export function detectSymptomsSimulated(text: string, species: Species): string[] {
  const haystack = normalize(text);
  if (!haystack.trim()) return [];
  const found: string[] = [];
  for (const { symptomId, needle } of patterns) {
    if (found.includes(symptomId)) continue;
    if (!speciesById.get(symptomId)?.includes(species)) continue;
    if (haystack.includes(needle)) found.push(symptomId);
  }
  return found;
}
