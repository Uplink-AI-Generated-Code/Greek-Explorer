import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Phrase, Token } from '../types';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels';

const kafes = (patch: Partial<PanelState> = {}): PanelState => ({
  slot: { pos: 'noun', number: 'sg', case: 'acc' },
  noun: null,
  nounNumber: 'sg',
  ...patch,
});
const panelOf = (lexeme: string, state: PanelState) =>
  buildPanel(state, { text: '', lexeme, slot: state.slot }, 'beginner');
const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});
const whose = (p: ReturnType<typeof panelOf>) => p.controls.find((c) => c.key === 'possessor');

describe('the noun panel: Whose?', () => {
  it('starts with nobody and offers the seven possessors', () => {
    const p = panelOf('kafes', kafes());
    expect(whose(p)?.value).toBe('none');
    expect(whose(p)?.options.map((o) => o.label)).toEqual(['nobody', 'my', 'your', 'his', 'her', 'our', 'your (pl.)', 'their']);
    expect(p.rows.map((r) => r.label)).toEqual(['the', 'a / an']);
  });

  it('adds a row "with a possessive" when someone is chosen, and takes it away again', () => {
    const mine = applyControl(kafes(), 'possessor', '1sg');
    const p = panelOf('kafes', mine);
    expect(whose(p)?.value).toBe('1sg');
    expect(p.rows.map((r) => r.label)).toEqual(['the', 'a / an', 'with a possessive']);
    expect(cells(p.rows, 2)).toEqual({ el: 'τον καφέ μου', ro: 'cafeaua mea', en: 'my coffee' });
    const none = applyControl(mine, 'possessor', 'none');
    expect(none).not.toHaveProperty('possessor');
    expect(panelOf('kafes', none).rows).toHaveLength(2);
  });

  it('follows the role and the number of the noun, and the second accent', () => {
    const sea = applyControl(kafes({ slot: { pos: 'noun', number: 'pl', case: 'nom' } }), 'possessor', '1pl');
    expect(cells(panelOf('thalassa', sea).rows, 2)).toEqual({ el: 'οι θάλασσές μας', ro: 'mările noastre', en: 'our seas' });
    const gen = applyControl(kafes({ slot: { pos: 'noun', number: 'sg', case: 'gen' } }), 'possessor', '2sg');
    expect(cells(panelOf('spiti', gen).rows, 2)).toEqual({ el: 'του σπιτιού σου', ro: 'casei tale', en: 'of your house' });
  });

  it('the state differs from the phrase while someone is chosen', () => {
    expect(sameState(kafes(), applyControl(kafes(), 'possessor', '3pl'))).toBe(false);
  });
});

describe('the noun a possessive points at', () => {
  const tokens: Token[] = [
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
    { text: 'σπίτι', lexeme: 'spiti', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    { text: 'μου', lexeme: 'possessive', slot: { pos: 'possessive', person: 1, number: 'sg' }, agreesWith: 1 },
  ];
  const phrase: Phrase = { id: 'x', title: 'x', theme: 'x', level: 'beginner', tokens, glosses: [], verified: false };

  it('starts with that possessor, so the panel already shows το σπίτι μου', () => {
    const state = initialState(tokens[1], phrase);
    expect(state.possessor).toEqual({ pos: 'possessive', person: 1, number: 'sg' });
    expect(cells(panelOf('spiti', state).rows, 2)).toEqual({ el: 'το σπίτι μου', ro: 'casa mea', en: 'my house' });
  });

  it('gives the article and the possessive no possessor of their own', () => {
    expect(initialState(tokens[0], phrase)).not.toHaveProperty('possessor');
    expect(initialState(tokens[2], phrase)).not.toHaveProperty('possessor');
  });
});
