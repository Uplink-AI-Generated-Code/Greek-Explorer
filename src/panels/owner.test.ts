import { describe, expect, it } from 'vitest';
import { PHRASES } from '../data/phrases';
import { richText } from '../engine/segments';
import type { Level, Phrase, SlotOf, Token } from '../types';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels';

const slot = (patch: Partial<SlotOf<'noun'>> = {}): SlotOf<'noun'> => ({ pos: 'noun', number: 'sg', case: 'nom', ...patch });
const stateOf = (patch: Partial<PanelState> = {}, s: SlotOf<'noun'> = slot()): PanelState => ({ slot: s, noun: null, nounNumber: 'sg', ...patch });
const panelOf = (state: PanelState, level: Level = 'beginner') =>
  buildPanel(state, { text: 'σπίτι', lexeme: 'spiti', slot: state.slot }, level);
const cells = (rows: { el: unknown; ro: unknown; en: unknown }[], i: number) => ({
  el: richText(rows[i].el as never),
  ro: richText(rows[i].ro as never),
  en: richText(rows[i].en as never),
});
const phrase = (id: string): Phrase => PHRASES.find((p) => p.id === id)!;

describe('the noun panel with a noun possessor', () => {
  it('has no such row until a noun owns it', () => {
    const p = panelOf(stateOf());
    expect(p.rows.map((r) => r.label)).toEqual(['the', 'a / an']);
    expect(p.controls.find((c) => c.key === 'owner')?.value).toBe('none');
  });

  it('shows the phrase with the owner in the genitive', () => {
    const p = panelOf(stateOf({ owner: 'paidi' }));
    expect(p.rows.map((r) => r.label)).toEqual(['the', 'a / an', 'with a noun possessor']);
    expect(cells(p.rows, 2)).toEqual({ el: 'το σπίτι του παιδιού', ro: 'casa copilului', en: "the child's house" });
    expect(p.controls.find((c) => c.key === 'owner')?.value).toBe('paidi');
  });

  it('offers nobody and every noun', () => {
    const options = panelOf(stateOf()).controls.find((c) => c.key === 'owner')!.options;
    expect(options[0]).toEqual({ value: 'none', label: 'nobody' });
    expect(options.map((o) => o.value)).toContain('skylos');
    expect(options.map((o) => o.value)).toContain('thalassa');
  });

  it('follows the number and the role of the noun, and goes with "many" but not with a count', () => {
    const many = panelOf(stateOf({ owner: 'paidi' }, slot({ number: 'pl' })));
    expect(cells(many.rows, 2).el).toBe('τα σπίτια του παιδιού');
    const three = panelOf(stateOf({ owner: 'paidi' }, slot({ number: 'pl', count: 3 })));
    expect(three.rows.map((r) => r.label)).toEqual(['the', 'with a number']);
    const genitive = panelOf(stateOf({ owner: 'paidi' }, slot({ case: 'gen' })));
    expect(cells(genitive.rows, 2)).toEqual({ el: 'του σπιτιού του παιδιού', ro: 'casei copilului', en: "of the child's house" });
  });

  it('a noun owner and a pronoun possessor do not go together: choosing one drops the other', () => {
    let s = applyControl(stateOf({ possessor: { pos: 'possessive', person: 1, number: 'sg' } }), 'owner', 'paidi');
    expect(s.owner).toBe('paidi');
    expect(s.possessor).toBeUndefined();
    s = applyControl(s, 'possessor', '2sg');
    expect(s.possessor).toMatchObject({ person: 2 });
    expect(s.owner).toBeUndefined();
    s = applyControl(applyControl(s, 'owner', 'skylos'), 'owner', 'none');
    expect(s.owner).toBeUndefined();
  });

  it('does not apply to other parts of speech', () => {
    const adj: PanelState = { slot: { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' }, noun: 'spiti', nounNumber: 'sg' };
    expect(applyControl(adj, 'owner', 'paidi')).toBe(adj);
  });
});

describe('seeding the noun panel from a phrase with a noun possessor', () => {
  const house = phrase('the-childs-house');

  it('starts the possessed noun with its owner', () => {
    const state = initialState(house.tokens[1], house);
    expect(state.owner).toBe('paidi');
    expect(cells(panelOf(state).rows, 2).en).toBe("the child's house");
  });

  it('does not seed the owner noun itself', () => {
    expect(initialState(house.tokens[3], house).owner).toBeUndefined();
  });

  it('nobody, then the phrase’s own owner again, is the phrase again', () => {
    const start = initialState(house.tokens[1], house);
    const back = applyControl(applyControl(start, 'owner', 'none'), 'owner', 'paidi');
    expect(sameState(back, start)).toBe(true);
  });

  it('a possessive phrase seeds no owner', () => {
    const mine = phrase('my-house');
    expect(initialState(mine.tokens[1], mine).owner).toBeUndefined();
  });
});
