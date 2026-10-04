import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Clitic, SlotOf } from '../types';
import { readingFor } from './reading';

const to: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const mou: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const command = (clitics: Clitic[], extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', clitics, ...extra,
});

describe('the reading of a command with a pronoun', () => {
  it('φάε το: the pronoun is a part of its own', () => {
    const { el } = readingFor(getVerb('troo'), command([to]));
    expect(el.parts.map((p) => [p.label, p.role, p.piece])).toEqual([
      ['φά-', 'stem', 0],
      ['-ε', 'ending', 0],
      ['το', 'clitic', 1],
    ]);
    expect(el.parts[2].gloss).toBe('it');
    expect(el.beginner).toBe('φάε το: φά- = eat, -ε = a command to you: do it once, το = it.');
    expect(el.improver).toContain('accusative pronoun το');
  });

  it('an indirect pronoun reads "to me"', () => {
    const { el } = readingFor(getVerb('dino'), command([mou]));
    expect(el.parts.find((p) => p.role === 'clitic')?.gloss).toBe('to me');
  });

  it('two pronouns: both are described, genitive then accusative', () => {
    const { el } = readingFor(getVerb('dino'), command([mou, to], { shortForm: false }));
    expect(el.improver).toContain('genitive pronoun μού');
    expect(el.improver).toContain('accusative pronoun το');
  });

  it('a negative command: μην, the pronoun, then the verb', () => {
    const { el } = readingFor(getVerb('troo'), command([to], { polarity: 'negative' }));
    expect(el.parts.map((p) => [p.label, p.role, p.piece])).toEqual([
      ['μην', 'negation', 0],
      ['το', 'clitic', 1],
      ['φα-', 'stem', 2],
      ['-ς', 'ending', 2],
    ]);
    expect(el.beginner).toContain('To forbid something');
  });
});

describe('the reading of the stress rule and of short forms', () => {
  it('δώσε μού το uses the clitic-stress template', () => {
    const { el } = readingFor(getVerb('dino'), command([mou, to]));
    expect(el.beginner).toContain('Greek adds a second accent');
    expect(el.improver).toContain('two syllables after the original stress');
    expect(el.parts.filter((p) => p.role === 'clitic').map((p) => p.label)).toEqual(['μού', 'το']);
  });

  it('φάτο is one joined part and uses the short-imperative template', () => {
    const { el } = readingFor(getVerb('troo'), command([to], { shortForm: true }));
    expect(el.parts).toEqual([{ text: 'φάτο', label: 'φάτο', role: 'fused', gloss: 'φάε + το, joined', piece: 0 }]);
    expect(el.beginner).toContain('A short way of saying φάε το');
    expect(el.improver).toContain('A short way of saying φάε το');
  });

  it('δως μου το: the shortened verb and the pronouns', () => {
    const { el } = readingFor(getVerb('dino'), command([mou, to], { shortForm: true }));
    expect(el.beginner).toContain('δως is a short form of δώσε');
    expect(el.parts.filter((p) => p.role === 'clitic').map((p) => p.gloss)).toEqual(['to me', 'it']);
  });

  it('a form with pronouns has no Romanian or English line', () => {
    const reading = readingFor(getVerb('troo'), command([to], { polarity: 'negative' }));
    expect(reading.ro).toBeUndefined();
    expect(reading.en).toBeUndefined();
  });
});
