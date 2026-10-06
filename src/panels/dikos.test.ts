import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, Phrase, SlotOf, Token } from '../types';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels';

const slot: SlotOf<'adjective'> = { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' };
const token: Token = { text: 'δικό', lexeme: 'dikos', slot, agreesWith: 3 };
const stateOf = (patch: Partial<PanelState> = {}): PanelState => ({
  slot,
  possessor: { pos: 'possessive', person: 1, number: 'sg' },
  noun: 'spiti',
  nounNumber: 'sg',
  ...patch,
});
const panelOf = (state: PanelState, level: Level = 'beginner') => buildPanel(state, { ...token, slot: state.slot }, level);
const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});
const control = (p: ReturnType<typeof panelOf>, key: string) => p.controls.find((c) => c.key === key);

describe('the δικός panel', () => {
  it('shows the phrase before the noun and on its own', () => {
    const p = panelOf(stateOf());
    expect(p.lemma).toBe('δικός / δική / δικό');
    expect(p.posLabel).toBe('adjective: own (mine)');
    expect(p.rows.map((r) => r.label)).toEqual(['before the noun', 'on its own']);
    expect(cells(p.rows, 0)).toEqual({ el: 'το δικό μου σπίτι', ro: 'propria mea casă', en: 'my own house' });
    expect(cells(p.rows, 1)).toEqual({ el: 'το δικό μου', ro: 'a mea', en: 'mine' });
  });

  it('starts as "my" when nothing says whose', () => {
    const { possessor: _p, ...bare } = stateOf();
    expect(cells(panelOf(bare).rows, 0).en).toBe('my own house');
    expect(control(panelOf(bare), 'possessor')?.value).toBe('1sg');
  });

  it('offers the noun, how many, the role (no genitive) and Whose?', () => {
    const p = panelOf(stateOf(), 'improver');
    expect(p.controls.map((c) => c.key)).toEqual(['noun', 'number', 'case', 'possessor']);
    expect(control(p, 'case')?.options.map((o) => o.value)).toEqual(['nom', 'acc']);
    expect(control(p, 'possessor')?.options).toHaveLength(7);
  });

  it('changes with Whose?, the noun, the number and the role', () => {
    let s = stateOf();
    s = applyControl(s, 'possessor', '3sg-f');
    expect(cells(panelOf(s).rows, 0)).toEqual({ el: 'το δικό της σπίτι', ro: 'propria ei casă', en: 'her own house' });
    s = applyControl(s, 'noun', 'skylos');
    expect(s.slot).toEqual({ pos: 'adjective', gender: 'm', number: 'sg', case: 'nom' });
    expect(cells(panelOf(s).rows, 0).el).toBe('ο δικός της σκύλος');
    s = applyControl(s, 'number', 'pl');
    expect(cells(panelOf(s).rows, 1)).toEqual({ el: 'οι δικοί της', ro: 'ai ei', en: 'hers' });
    s = applyControl(s, 'case', 'acc');
    expect(cells(panelOf(s).rows, 0).el).toBe('τους δικούς της σκύλους');
  });

  it('Improver: gender by role for the number, with the form in use outlined', () => {
    const p = panelOf(stateOf(), 'improver');
    expect(p.full.map((r) => r.label)).toEqual([
      'masc. nominative', 'masc. accusative', 'fem. nominative', 'fem. accusative', 'neut. nominative', 'neut. accusative',
    ]);
    expect(cells(p.full, 0)).toEqual({ el: 'ο δικός μου', ro: 'al meu', en: 'mine' });
    expect(cells(p.full, 3)).toEqual({ el: 'την δική μου', ro: 'a mea', en: 'mine' });
    expect(cells(p.full, 4)).toEqual({ el: 'το δικό μου', ro: 'al meu', en: 'mine' });
    expect(p.full.map((r) => r.hl?.el)).toEqual([false, false, false, false, true, false]);
    expect(p.full.map((r) => r.hl?.ro)).toEqual([false, false, true, false, false, false]);
    expect(panelOf(stateOf(), 'beginner').full).toEqual([]);
  });

  it('is the ordinary adjective panel for any other adjective', () => {
    const zestos: Token = { text: 'ζεστός', lexeme: 'zestos', slot: { pos: 'adjective', gender: 'm', number: 'sg', case: 'nom' } };
    const p = buildPanel({ slot: zestos.slot, noun: 'kafes', nounNumber: 'sg' }, zestos, 'beginner');
    expect(p.controls.map((c) => c.key)).toEqual(['noun', 'number', 'case']);
  });
});

describe('seeding the δικός panel from a phrase', () => {
  const phrase = {
    tokens: [
      { text: 'Το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 3 },
      { text: 'δικό', lexeme: 'dikos', slot, agreesWith: 3 },
      { text: 'της', lexeme: 'possessive', slot: { pos: 'possessive', person: 3, number: 'sg', gender: 'f' }, agreesWith: 3 },
      { text: 'σπίτι', lexeme: 'spiti', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    ],
  } as unknown as Phrase;

  it('takes the possessor of the possessive that follows it', () => {
    const state = initialState(phrase.tokens[1], phrase);
    expect(state.possessor).toEqual({ pos: 'possessive', person: 3, number: 'sg', gender: 'f' });
    expect(state.noun).toBe('spiti');
    expect(cells(panelOf(state).rows, 0).en).toBe('her own house');
  });

  it('choosing the phrase’s own possessor again is no change', () => {
    const state = initialState(phrase.tokens[1], phrase);
    expect(sameState(applyControl(applyControl(state, 'possessor', '1sg'), 'possessor', '3sg-f'), state)).toBe(true);
  });
});
