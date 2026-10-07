import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import { compose } from '../engine/compose';
import { readingFor } from '../engine/reading';
import { richText } from '../engine/segments';
import type { Clitic, SlotOf } from '../types';
import { PHRASES } from '../data/phrases';
import { applyControl, buildPanel, initialState, type PanelState } from './panels';

const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f', enPronoun: 'it' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const command = (extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...extra,
});
const stateOf = (slot: SlotOf<'verb'>, noun: string | null = null): PanelState => ({ slot, noun, nounNumber: 'sg' });
const panelOf = (lexeme: string, state: PanelState) => buildPanel(state, { text: '', lexeme, slot: state.slot }, 'beginner');

describe('C1: Who? on a command with a short form', () => {
  it('Eat it! as plural drops the short form and keeps the pronoun', () => {
    const start = stateOf(command({ clitics: [IT], shortForm: true }), 'psomi');
    const next = applyControl(start, 'who', '2pl', 'troo');
    expect(next.slot).not.toHaveProperty('shortForm');
    expect(next.slot).toMatchObject({ number: 'pl', clitics: [IT] });
    expect(() => panelOf('troo', next)).not.toThrow();
  });
  it('Give it to me! as plural drops the short form and keeps both pronouns', () => {
    const start = stateOf(command({ clitics: [ME, IT], shortForm: true }), 'psomi');
    const next = applyControl(start, 'who', '2pl', 'dino');
    expect(next.slot).not.toHaveProperty('shortForm');
    expect(next.slot).toMatchObject({ number: 'pl', clitics: [ME, IT] });
    expect(() => panelOf('dino', next)).not.toThrow();
  });
});

describe('I2: the verb piece is found, not assumed to be last', () => {
  const present = command({ tense: 'present', clitics: [IT] });
  it('τρώε το carries the note about the older forms in the panel and the reading', () => {
    expect(compose(getVerb('troo'), present).text).toBe('τρώε το');
    expect(panelOf('troo', stateOf(present, 'psomi')).irregular).toContain('τρώγε, τρώγετε');
    expect(readingFor(getVerb('troo'), present).el.beginner).toContain('τρώγε and τρώγετε');
  });
});

describe('I3 and I4: the English pronoun and the gender', () => {
  const eatIt = stateOf(command({ clitics: [IT] }), 'psomi');
  it('the coffee as a pronoun is "it", not "him"', () => {
    const next = applyControl(stateOf(command(), 'kafes'), 'object', 'pronoun', 'troo');
    expect(next.slot.pos === 'verb' && next.slot.clitics?.[0].enPronoun).toBe('it');
    expect(richText(panelOf('troo', next).rows[0].en)).toBe('eat it');
  });
  it('the child as a pronoun is "him / her / it"', () => {
    const next = applyControl(stateOf(command(), 'paidi'), 'object', 'pronoun', 'pleno');
    expect(richText(panelOf('pleno', next).rows[0].en)).toBe('wash him / her / it');
  });
  it('the pronoun panel: Gender = masculine drops the Romanian gender and the English word', () => {
    const clitic: PanelState = { slot: { pos: 'clitic', ...IT }, noun: null, nounNumber: 'sg' };
    const next = applyControl(clitic, 'gender', 'm');
    expect(next.slot).not.toHaveProperty('roGender');
    expect(next.slot).not.toHaveProperty('enPronoun');
    const panel = buildPanel(next, { text: '', lexeme: 'clitic', slot: next.slot }, 'beginner');
    expect([richText(panel.rows[0].el), richText(panel.rows[0].ro), richText(panel.rows[0].en)]).toEqual(['τον', 'îl', 'him']);
    expect(eatIt.slot).toBeDefined();
  });
});

describe('M1: the object noun does not outlive the command', () => {
  it('imperative -> indicative -> imperative shows no noun', () => {
    const start = stateOf(command(), 'psomi');
    const indicative = applyControl(start, 'mood', 'indicative', 'troo');
    expect(indicative.noun).toBeNull();
    const back = applyControl(indicative, 'mood', 'imperative', 'troo');
    expect(back.noun).toBeNull();
    expect(panelOf('troo', back).controls.find((c) => c.key === 'object')?.value).toBe('none');
  });
  it('a command that stays a command keeps its noun', () => {
    expect(applyControl(stateOf(command(), 'psomi'), 'tense', 'present', 'troo').noun).toBe('psomi');
  });
});

describe('M5: Keep eating the bread! holds its noun like the other bread commands', () => {
  it("the verb's panel row has the object", () => {
    const phrase = PHRASES.find((p) => p.id === 'keep-eating-the-bread');
    if (!phrase) throw new Error('phrase 27 exists');
    const state = initialState(phrase.tokens[0], phrase);
    expect(state.noun).toBe('psomi');
    expect(richText(buildPanel(state, phrase.tokens[0], 'beginner').rows[0].el)).toBe('τρώε το ψωμί');
  });
});
