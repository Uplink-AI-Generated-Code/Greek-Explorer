import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { inflect } from '../engine/greek';
import { formText } from '../engine/segments';
import { slotsFor, validate } from './validate';

describe('the possessive in the validator', () => {
  it('has the seven possessors as slots, each with a Greek form', () => {
    const slots = slotsFor(LEXEMES.possessive);
    expect(slots).toHaveLength(7);
    expect(slots.map((s) => formText(inflect(LEXEMES.possessive, s)))).toEqual(['μου', 'σου', 'του', 'της', 'μας', 'σας', 'τους']);
  });

  it('accepts the real data, and the possessive is unverified like every new lexeme', () => {
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
    expect(LEXEMES.possessive.verified).toEqual({ el: false, ro: false, en: false });
  });

  it('a slot of another part of speech does not fit the lexeme', () => {
    expect(() => inflect(LEXEMES.possessive, { pos: 'clitic', role: 'object', person: 1, number: 'sg' })).toThrow(/does not fit/);
  });
});
