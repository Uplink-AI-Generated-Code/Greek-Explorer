import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GreekRelative } from '../types';
import { slotsFor, validate } from './validate';

const pou = LEXEMES['rel-pou'] as GreekRelative;

describe('the relative lexemes in the validator', () => {
  it('are valid', () => {
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
  });

  it('offer every job, with every preposition for the job after a preposition', () => {
    const slots = slotsFor(pou);
    // 3 genders × 2 numbers × (4 jobs + 7 prepositions)
    expect(slots).toHaveLength(66);
    expect(slots.filter((s) => s.pos === 'relative' && s.role === 'preposition')).toHaveLength(42);
    expect(slots.filter((s) => s.pos === 'relative' && s.role !== 'preposition').every((s) => s.pos === 'relative' && s.preposition === undefined)).toBe(true);
  });

  it('wants a meaning', () => {
    expect(validate({ lexemes: { ...LEXEMES, 'rel-pou': { ...pou, meaning: '' } }, phrases: [] })).toContain('lexeme rel-pou: an empty meaning');
  });
});
