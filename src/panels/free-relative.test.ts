import { describe, expect, it } from 'vitest';
import { getLexeme } from '../data/lexemes';
import { inflect } from '../engine/greek';
import { formText, richText } from '../engine/segments';
import type { GreekFreeRelative, Token } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const state: PanelState = { slot: { pos: 'freeRelative' }, noun: null, nounNumber: 'sg' };
const token = (lexeme: string): Token => ({ text: lexeme, lexeme, slot: { pos: 'freeRelative' } });
const panelOf = (lexeme: string, level: 'beginner' | 'improver' = 'beginner') => buildPanel(state, token(lexeme), level);
const cells = (p: ReturnType<typeof panelOf>, i: number) => ({ el: richText(p.rows[i].el), ro: richText(p.rows[i].ro), en: richText(p.rows[i].en) });

describe('the free relatives ό,τι and όπου', () => {
  it('are unverified lexemes that never change', () => {
    for (const id of ['free-oti', 'free-opou']) {
      const lexeme = getLexeme(id) as GreekFreeRelative;
      expect(lexeme.pos).toBe('freeRelative');
      expect(lexeme.verified).toEqual({ el: false, ro: false, en: false });
      expect(formText(inflect(lexeme, { pos: 'freeRelative' }))).toBe(lexeme.lemma);
    }
    expect([getLexeme('free-oti').lemma, getLexeme('free-opou').lemma]).toEqual(['ό,τι', 'όπου']);
  });

  it('ό,τι: one Greek word, two Romanian and two English words', () => {
    const p = panelOf('free-oti');
    expect(p.lemma).toBe('ό,τι');
    expect(p.posLabel).toBe('free relative: whatever');
    expect(p.controls).toEqual([]);
    expect(p.rows.map((r) => r.label)).toEqual(['whatever', 'what', 'in a sentence (whatever)', 'in a sentence (what)']);
    expect(cells(p, 0)).toEqual({ el: 'ό,τι', ro: 'orice', en: 'whatever' });
    expect(cells(p, 1)).toEqual({ el: 'ό,τι', ro: 'ce', en: 'what' });
    expect(cells(p, 2)).toEqual({ el: 'Ό,τι θέλεις', ro: 'Orice vrei', en: 'Whatever you want' });
    expect(cells(p, 3)).toEqual({ el: 'Ό,τι έχω', ro: 'Ce am', en: 'What I have' });
  });

  it('όπου: where and wherever, unde and oriunde', () => {
    const p = panelOf('free-opou', 'improver');
    expect(p.posLabel).toBe('free relative · never changes');
    expect(cells(p, 0)).toEqual({ el: 'όπου', ro: 'oriunde', en: 'wherever' });
    expect(cells(p, 1)).toEqual({ el: 'όπου', ro: 'unde', en: 'where' });
    expect(cells(p, 2)).toEqual({ el: 'Όπου πας', ro: 'Oriunde mergi', en: 'Wherever you go' });
    expect(cells(p, 3)).toEqual({ el: 'Εκεί όπου είναι το σπίτι', ro: 'Acolo unde este casa', en: 'There where the house is' });
    expect(p.full).toEqual([]);
  });

  it('have no controls to apply', () => {
    expect(applyControl(state, 'case', 'gen')).toBe(state);
    expect(applyControl(state, 'number', 'pl')).toBe(state);
  });
});
