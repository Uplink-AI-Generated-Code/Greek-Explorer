import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Phrase, SlotOf, Token } from '../types';
import { applyControl, buildPanel, initialState, sameState, type PanelState } from './panels';

const slotOf = (patch: Partial<SlotOf<'relative'>> = {}): SlotOf<'relative'> => ({ pos: 'relative', role: 'subject', gender: 'n', number: 'sg', ...patch });
const state = (slot = slotOf(), noun = 'paidi', patch: Partial<PanelState> = {}): PanelState => ({ slot, noun, nounNumber: slot.number, ...patch });
const first = (s: PanelState) => richText(buildPanel(s, { text: '', lexeme: 'rel-opoios', slot: s.slot }, 'beginner').rows[0].el);

describe('the relative pronoun controls', () => {
  it('the role control changes the job, and the preposition comes and goes with it', () => {
    const toPreposition = applyControl(state(), 'role', 'preposition');
    expect(toPreposition.slot).toEqual({ pos: 'relative', role: 'preposition', gender: 'n', number: 'sg', preposition: 'me' });
    const back = applyControl(toPreposition, 'role', 'object');
    expect(back.slot).toEqual({ pos: 'relative', role: 'object', gender: 'n', number: 'sg' });
    expect('preposition' in back.slot).toBe(false);
    expect(applyControl(applyControl(state(slotOf({ role: 'preposition', preposition: 'gia' })), 'role', 'whose'), 'role', 'preposition').slot).toMatchObject({ preposition: 'me' });
  });

  it('the preposition control changes the preposition, only after a preposition and only from the list', () => {
    const at = state(slotOf({ role: 'preposition', preposition: 'me' }));
    expect(applyControl(at, 'preposition', 'gia').slot).toMatchObject({ preposition: 'gia' });
    expect(first(applyControl(at, 'preposition', 'se'))).toBe('στο οποίο');
    expect(applyControl(at, 'preposition', 'thelo')).toBe(at);
    const subject = state();
    expect(applyControl(subject, 'preposition', 'gia')).toBe(subject);
  });

  it('the number and the noun change the slot: the noun brings its gender', () => {
    const plural = applyControl(state(slotOf({ role: 'indirect' })), 'number', 'pl');
    expect(plural.slot).toMatchObject({ number: 'pl' });
    expect(first(plural)).toBe('στα οποία');
    const dog = applyControl(state(slotOf({ role: 'object' })), 'noun', 'skylos');
    expect(dog).toMatchObject({ noun: 'skylos', slot: { gender: 'm' } });
    expect(first(dog)).toBe('τον οποίο');
  });

  it('the Noun owned control sets the noun owned, and choosing nothing new changes nothing', () => {
    const whose = state(slotOf({ role: 'whose', gender: 'm' }), 'skylos');
    const chosen = applyControl(whose, 'owned', 'paidi');
    expect(chosen.owned).toBe('paidi');
    expect(first(chosen)).toBe('του οποίου το παιδί');
    expect(applyControl(whose, 'owned', 'thelo')).toBe(whose);
  });

  it('the other parts of speech ignore the new controls', () => {
    const noun: PanelState = { slot: { pos: 'noun', number: 'sg', case: 'nom' }, noun: null, nounNumber: 'sg' };
    expect(applyControl(noun, 'owned', 'paidi')).toBe(noun);
    expect(applyControl(noun, 'preposition', 'me')).toBe(noun);
  });
});

describe('seeding the relative pronoun panel from a phrase', () => {
  const tokens: Token[] = [
    { text: 'Το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
    { text: 'παιδί', lexeme: 'paidi', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    { text: 'του οποίου', lexeme: 'rel-opoios', slot: slotOf({ role: 'whose' }), agreesWith: 1 },
    { text: 'ο', lexeme: 'def', slot: { pos: 'article', gender: 'm', number: 'sg', case: 'nom' }, agreesWith: 4 },
    { text: 'σκύλος', lexeme: 'skylos', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
  ];
  const phrase = { id: 'x', title: 'x', theme: 'x', level: 'beginner' as const, tokens, glosses: [], verified: false } satisfies Phrase;

  it('starts with the antecedent and, for "whose", the noun that follows', () => {
    const s = initialState(tokens[2], phrase);
    expect(s.noun).toBe('paidi');
    expect(s.owned).toBe('skylos');
    expect(first(s)).toBe('του οποίου ο σκύλος');
  });

  it('does not seed an owned noun for another job', () => {
    const object = { ...tokens[2], slot: slotOf({ role: 'object' }) };
    expect(initialState(object, { ...phrase, tokens: [tokens[0], tokens[1], object, tokens[3], tokens[4]] }).owned).toBeUndefined();
  });

  it('choosing the phrase’s own owned noun again is no change', () => {
    const start = initialState(tokens[2], phrase);
    expect(sameState(applyControl(applyControl(start, 'owned', 'spiti'), 'owned', 'skylos'), start)).toBe(true);
  });

  it('a role round trip returns the same state', () => {
    const start = initialState({ ...tokens[2], slot: slotOf({ role: 'object' }) }, phrase);
    expect(sameState(applyControl(applyControl(start, 'role', 'preposition'), 'role', 'object'), start)).toBe(true);
  });
});
