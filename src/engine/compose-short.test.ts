import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Clitic, GreekVerb, SlotOf } from '../types';
import { compose } from './compose';
import { shortFormOf, slotProblem } from './offers';

const to: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const ton: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'm', roGender: 'm' };
const mou: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const command = (clitics: Clitic[], extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', clitics, shortForm: true, ...extra,
});

describe('φάτο: the short form that joins the pronoun', () => {
  it('is one fused piece with the two words it comes from', () => {
    const composed = compose(getVerb('troo'), command([to]));
    expect(composed.text).toBe('φάτο');
    expect(composed.pieces).toEqual([{ kind: 'fused', text: 'φάτο', of: ['φάε', 'το'] }]);
    expect(composed.irregular?.rule).toBe('short-imperative');
    expect(composed.extraAccent).toBeUndefined();
  });
  it('joins any single pronoun: φάτον', () => {
    expect(compose(getVerb('troo'), command([ton])).text).toBe('φάτον');
  });
});

describe('δως: the short form that stays a word of its own', () => {
  it('δως μου το: three pieces and no second accent', () => {
    const composed = compose(getVerb('dino'), command([mou, to]));
    expect(composed.text).toBe('δως μου το');
    expect(composed.pieces.map((p) => p.kind)).toEqual(['verb', 'clitic', 'clitic']);
    expect(composed.extraAccent).toBeUndefined();
    expect(composed.irregular?.rule).toBe('short-imperative');
  });
  it('δως το and δως μου', () => {
    expect(compose(getVerb('dino'), command([to])).text).toBe('δως το');
    expect(compose(getVerb('dino'), command([mou])).text).toBe('δως μου');
  });
  it('without shortForm the same pronouns give the full form and the second accent', () => {
    expect(compose(getVerb('dino'), command([mou, to], { shortForm: false })).text).toBe('δώσε μού το');
  });
});

describe('shortFormOf and slotProblem', () => {
  const troo = getVerb('troo');
  const dino = getVerb('dino');
  it('finds the stored short form of the aorist imperative, second person singular only', () => {
    expect(shortFormOf(troo, command([to]))?.fuse).toBe(true);
    expect(shortFormOf(dino, command([to]))?.fuse).toBe(false);
    expect(shortFormOf(troo, command([to], { number: 'pl' }))).toBeUndefined();
    expect(shortFormOf(troo, command([to], { tense: 'present' }))).toBeUndefined();
    expect(shortFormOf(getVerb('pleno'), command([to]))).toBeUndefined();
  });
  it('accepts a short form with a pronoun', () => {
    expect(slotProblem(troo, command([to]))).toBeNull();
    expect(slotProblem(dino, command([mou, to]))).toBeNull();
  });
  it('refuses a short form the verb lacks, with no pronoun, or in a negative command', () => {
    expect(slotProblem(getVerb('pleno'), command([to]))).toMatch(/has no short form/);
    expect(slotProblem(troo, command([]))).toMatch(/needs a pronoun/);
    expect(slotProblem(troo, command([to], { polarity: 'negative' }))).toMatch(/negative command has no short form/);
    expect(slotProblem(troo, command([to], { number: 'pl' }))).toMatch(/has no short form/);
  });
  it('refuses a short form outside a command', () => {
    expect(slotProblem(troo, command([], { mood: 'indicative', tense: 'present' }))).toMatch(/only with a command/);
  });
  it('a joined short form takes one pronoun', () => {
    const active = dino.voices.active;
    if (!active) throw new Error('δίνω has an active voice');
    const joinedDino: GreekVerb = {
      ...dino,
      voices: {
        active: { ...active, shortForms: { 'impAorist.2sg': { stem: 'δω', ending: 'ς', fuse: true, plain: 'x' } } },
      },
    };
    expect(slotProblem(joinedDino, command([mou, to]))).toMatch(/takes one pronoun/);
  });
});
