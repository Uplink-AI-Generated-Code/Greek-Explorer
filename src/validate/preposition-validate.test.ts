import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GreekPreposition } from '../types';
import { validate } from './validate';

const se = LEXEMES.se as GreekPreposition;
const check = (prep: GreekPreposition) => validate({ lexemes: { ...LEXEMES, se: prep }, phrases: [] });

describe('σε in the validator', () => {
  it('accepts the real data', () => {
    expect(check(se)).toEqual([]);
  });

  it('refuses a missing fused form and a fused form that does not start with σ', () => {
    const missing: GreekPreposition = { ...se, fused: { ...se.fused!, f: { sg: '', pl: 'στις' } } };
    expect(check(missing)).toContain('lexeme se: no fused form for f sg');
    const wrong: GreekPreposition = { ...se, fused: { ...se.fused!, n: { sg: 'το', pl: 'στα' } } };
    expect(check(wrong)).toContain('lexeme se: the fused form το does not start with σ');
  });

  it('refuses two meanings with the same value, and a meaning with an empty text', () => {
    const twice: GreekPreposition = { ...se, senses: [se.senses![0], se.senses![0]] };
    expect(check(twice)).toContain('lexeme se: two senses have the same value');
    const empty: GreekPreposition = { ...se, senses: [{ ...se.senses![0], en: '' }] };
    expect(check(empty)).toContain('lexeme se: the sense "to" has an empty text');
  });

  it('lets the person meaning have no Romanian word (the dative)', () => {
    expect(se.senses!.find((s) => s.value === 'person')?.ro).toBe('');
    expect(check(se)).toEqual([]);
  });
});
