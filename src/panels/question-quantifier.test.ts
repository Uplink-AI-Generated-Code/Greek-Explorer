import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Token } from '../types';
import { applyControl, buildPanel, initialState } from './panels';
import type { PanelState } from './panels';

const slotOf = (patch: Record<string, unknown> = {}) =>
  ({ pos: 'quantifier', gender: 'n', number: 'sg', case: 'acc', degree: 'plain', use: 'determiner', ...patch }) as Token['slot'] & { pos: 'quantifier' };
const panelFor = (lexeme: string, slot: ReturnType<typeof slotOf>, noun: string, level: 'beginner' | 'improver' = 'beginner') => {
  const state: PanelState = { slot, noun, nounNumber: slot.number };
  return buildPanel(state, { text: '', lexeme, slot }, level);
};
const cells = (p: ReturnType<typeof panelFor>, i: number) => ({
  el: richText(p.rows[i].el),
  ro: richText(p.rows[i].ro),
  en: richText(p.rows[i].en),
});
const control = (p: ReturnType<typeof panelFor>, key: string) => p.controls.find((c) => c.key === key);

describe('πόσος and ποιος: the panel', () => {
  it('πόσος with ψωμί: a mass noun reads "how much", and the badge says question word', () => {
    const p = panelFor('posos', slotOf(), 'psomi');
    expect(p.lemma).toBe('πόσος / πόση / πόσο');
    expect(cells(p, 0)).toEqual({ el: 'πόσο ψωμί', ro: 'câtă pâine', en: 'how much bread' });
    expect(cells(p, 1)).toEqual({ el: 'πόσο', ro: 'câtă', en: 'how much' });
    expect(p.badge).toBe('question word');
    expect(p.posLabel).toBe('question word: how much');
    expect(p.plain).toContain('mass reading');
  });

  it('πόσος offers the kind control; ποιος offers "how many?" instead', () => {
    expect(control(panelFor('posos', slotOf(), 'psomi'), 'kind')?.value).toBe('mass');
    const who = panelFor('poios', slotOf({ gender: 'm', case: 'nom' }), 'skylos');
    expect(control(who, 'kind')).toBeUndefined();
    expect(control(who, 'number')?.options.map((o) => o.label)).toEqual(['one', 'many']);
    expect(who.plain).not.toContain('mass reading');
  });

  it('offers the subject and object roles only', () => {
    const p = panelFor('poios', slotOf({ gender: 'm', case: 'nom' }), 'skylos', 'improver');
    expect(control(p, 'case')?.options.map((o) => o.value)).toEqual(['nom', 'acc']);
    expect(p.full).toHaveLength(6);
    expect(p.full.map((r) => r.label)).toEqual([
      'masc. nominative', 'masc. accusative', 'fem. nominative', 'fem. accusative', 'neut. nominative', 'neut. accusative',
    ]);
  });

  it('ποιος on its own is who and cine, before a noun which and care', () => {
    const p = panelFor('poios', slotOf({ gender: 'm', case: 'nom', use: 'pronoun' }), 'skylos');
    expect(cells(p, 0)).toEqual({ el: 'ποιος σκύλος', ro: 'care câine', en: 'which dog' });
    expect(cells(p, 1)).toEqual({ el: 'ποιος', ro: 'cine', en: 'who' });
  });

  it('the number control changes the number of a quantifier', () => {
    const state: PanelState = { slot: slotOf({ gender: 'm', case: 'nom' }), noun: 'skylos', nounNumber: 'sg' };
    const next = applyControl(state, 'number', 'pl');
    expect(next.slot).toMatchObject({ number: 'pl' });
  });

  it('a quantifier with no noun token starts with a noun of its gender (Ποιος είναι;)', () => {
    const token: Token = { text: 'Ποιος', lexeme: 'poios', slot: slotOf({ gender: 'm', case: 'nom', use: 'pronoun' }) };
    const phrase = { id: 'x', title: 'x', theme: 'x', level: 'beginner' as const, tokens: [token], glosses: [], verified: false };
    expect(initialState(token, phrase).noun).toBe('skylos');
    const f = { ...token, slot: slotOf({ gender: 'f' }) };
    expect(initialState(f, { ...phrase, tokens: [f] }).noun).toBe('alepou');
    const n = { ...token, slot: slotOf({ gender: 'n' }) };
    expect(initialState(n, { ...phrase, tokens: [n] }).noun).toBe('paidi');
  });
});
