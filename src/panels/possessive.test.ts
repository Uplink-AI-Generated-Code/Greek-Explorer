import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, SlotOf, Token } from '../types';
import { applyControl, buildPanel, initialState, type PanelState } from './panels';

const mine: SlotOf<'possessive'> = { pos: 'possessive', person: 1, number: 'sg' };
const stateOf = (noun: string, slot: SlotOf<'possessive'> = mine, patch: Partial<PanelState> = {}): PanelState => ({
  slot,
  noun,
  nounNumber: 'sg',
  nounCase: 'nom',
  ...patch,
});
const panelOf = (state: PanelState, level: Level = 'beginner') =>
  buildPanel(state, { text: 'μου', lexeme: 'possessive', slot: state.slot }, level);
const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});
const control = (p: ReturnType<typeof panelOf>, key: string) => p.controls.find((c) => c.key === key);

describe('the possessive panel', () => {
  it('shows the noun phrase with the possessive, and the pronoun on its own', () => {
    const p = panelOf(stateOf('spiti'));
    expect(p.lemma).toBe('μου, σου, του / της, μας, σας, τους');
    expect(p.posLabel).toBe('possessive: my');
    expect(p.rows.map((r) => r.label)).toEqual(['with a noun', 'on its own']);
    expect(cells(p.rows, 0)).toEqual({ el: 'το σπίτι μου', ro: 'casa mea', en: 'my house' });
    expect(cells(p.rows, 1)).toEqual({ el: 'μου', ro: 'meu / mea / mei / mele', en: 'my' });
  });

  it('the third person has one Romanian word for the pronoun on its own', () => {
    const her: SlotOf<'possessive'> = { pos: 'possessive', person: 3, number: 'sg', gender: 'f' };
    const p = panelOf(stateOf('paidi', her));
    expect(cells(p.rows, 0)).toEqual({ el: 'το παιδί της', ro: 'copilul ei', en: 'her child' });
    expect(cells(p.rows, 1)).toEqual({ el: 'της', ro: 'ei', en: 'her' });
  });

  it('offers Whose?, the noun, how many and the role', () => {
    const p = panelOf(stateOf('spiti'));
    expect(p.controls.map((c) => c.key)).toEqual(['possessor', 'noun', 'number', 'case']);
    expect(control(p, 'possessor')?.options.map((o) => o.label)).toEqual([
      'my', 'your', 'his', 'her', 'our', 'your (pl.)', 'their',
    ]);
    expect(control(p, 'possessor')?.value).toBe('1sg');
    expect(control(p, 'case')?.value).toBe('nom');
  });

  it('the controls change the possessor, the noun, its number and its role', () => {
    const start = stateOf('spiti');
    const toUs = applyControl(start, 'possessor', '1pl');
    expect(toUs.slot).toEqual({ pos: 'possessive', person: 1, number: 'pl' });
    expect(cells(panelOf(toUs).rows, 0)).toEqual({ el: 'το σπίτι μας', ro: 'casa noastră', en: 'our house' });
    const dog = applyControl(toUs, 'noun', 'skylos');
    expect(cells(panelOf(dog).rows, 0)).toEqual({ el: 'ο σκύλος μας', ro: 'câinele nostru', en: 'our dog' });
    const many = applyControl(dog, 'number', 'pl');
    expect(cells(panelOf(many).rows, 0)).toEqual({ el: 'οι σκύλοι μας', ro: 'câinii noștri', en: 'our dogs' });
    const gen = applyControl(start, 'case', 'gen');
    expect(cells(panelOf(gen).rows, 0)).toEqual({ el: 'του σπιτιού μου', ro: 'casei mele', en: 'of my house' });
    expect(applyControl(start, 'possessor', 'nobody')).toBe(start);
  });

  it('says why the noun takes a second accent, and only then', () => {
    const sea = panelOf(stateOf('thalassa'));
    expect(cells(sea.rows, 0)).toEqual({ el: 'η θάλασσά μου', ro: 'marea mea', en: 'my sea' });
    expect(sea.irregular).toContain('second accent');
    expect(panelOf(stateOf('spiti')).irregular).toBe('');
  });

  it('Improver lists the seven possessors for the noun, with the one in use outlined', () => {
    const full = panelOf(stateOf('spiti', { pos: 'possessive', person: 1, number: 'pl' }), 'improver').full;
    expect(full.map((r) => r.label)).toEqual(['my', 'your', 'his', 'her', 'our', 'your (pl.)', 'their']);
    expect(full.map((r) => richText(r.ro as never))).toEqual(['mea', 'ta', 'lui', 'ei', 'noastră', 'voastră', 'lor']);
    expect(full.filter((r) => r.hl).map((r) => r.label)).toEqual(['our']);
  });
});

describe('the possessive token in a phrase', () => {
  const tokens: Token[] = [
    { text: 'η', lexeme: 'def', slot: { pos: 'article', gender: 'f', number: 'pl', case: 'acc' }, agreesWith: 1 },
    { text: 'θάλασσές', lexeme: 'thalassa', slot: { pos: 'noun', number: 'pl', case: 'acc' } },
    { text: 'μας', lexeme: 'possessive', slot: { pos: 'possessive', person: 1, number: 'pl' }, agreesWith: 1 },
  ];
  const phrase = { id: 'x', title: 'x', theme: 'x', level: 'beginner' as const, tokens, glosses: [], verified: false };

  it('starts with the noun, its number and its role from the phrase', () => {
    expect(initialState(tokens[2], phrase)).toMatchObject({ noun: 'thalassa', nounNumber: 'pl', nounCase: 'acc' });
    expect(cells(panelOf(initialState(tokens[2], phrase)).rows, 0)).toEqual({
      el: 'τις θάλασσές μας',
      ro: 'mările noastre',
      en: 'our seas',
    });
  });

  it('does not add a role to the state of any other token', () => {
    expect(initialState(tokens[1], phrase)).not.toHaveProperty('nounCase');
  });
});
