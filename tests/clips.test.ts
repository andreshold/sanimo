/**
 * Clips audio (feuille de route D3, étape 7) : le texte lu est toujours identique au texte affiché,
 * et chaque texte lu à voix haute a son clip.
 */

import advice from '../content/consignes.json';
import clipsJson from '../content/clips.json';
import questions from '../content/questions.json';
import toxics from '../content/toxiques.json';
import { ht } from '@/i18n/ht';
import type { Clip } from '@/triage/content-types';

const clips = clipsJson as Clip[];
const byId = new Map(clips.map((c) => [c.id, c]));

function i18n(key: string): unknown {
  return key.split('.').reduce<unknown>((node, k) => (node as Record<string, unknown> | undefined)?.[k], ht);
}

describe('clips audio', () => {
  it('cible de 80 à 150 clips, ids uniques', () => {
    expect(clips.length).toBeGreaterThanOrEqual(80);
    expect(clips.length).toBeLessThanOrEqual(150);
    expect(byId.size).toBe(clips.length);
  });

  it('clips d’écran : même texte que src/i18n/ht.ts', () => {
    const diffs = clips
      .filter((c) => c.i18nKey)
      .filter((c) => i18n(c.i18nKey!) !== c.text)
      .map((c) => `${c.id} (${c.i18nKey}) : « ${String(i18n(c.i18nKey!))} » ≠ « ${c.text} »`);
    expect(diffs).toEqual([]);
  });

  it('chaque question, consigne et toxique a son clip, avec le même texte', () => {
    const missing = [
      ...questions.map((q) => [q.id, q.clipId, q.text] as const),
      ...advice.map((a) => [a.id, a.clipId, a.text] as const),
      ...toxics.map((t) => [t.id, t.clipId, t.message] as const),
    ]
      .filter(([, clipId, text]) => !clipId || byId.get(clipId)?.text !== text)
      .map(([id]) => id);
    expect(missing).toEqual([]);
  });

  it('chaque niveau a son clip (E30)', () => {
    for (const level of ['ijans', 'konsilte', 'siveye']) {
      expect(clips.find((c) => c.i18nKey === `level.${level}.meaning`)).toBeDefined();
    }
  });

  it('aucun clip de plus de 15 s (35 mots)', () => {
    expect(clips.filter((c) => c.words > 35).map((c) => c.id)).toEqual([]);
  });
});
