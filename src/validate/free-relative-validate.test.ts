import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GreekFreeRelative } from '../types';
import { slotsFor, validate } from './validate';

const oti = LEXEMES['free-oti'] as GreekFreeRelative;

describe('the free relatives in the validator', () => {
  it('are valid and offer one slot', () => {
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
    expect(slotsFor(oti)).toEqual([{ pos: 'freeRelative' }]);
  });

  it('want every text to be filled in', () => {
    const bad = { ...LEXEMES, 'free-oti': { ...oti, ro: { ...oti.ro, ever: '' } } };
    expect(validate({ lexemes: bad, phrases: [] })).toContain('lexeme free-oti: an empty Romanian, English, meaning or example text');
    const noExample = { ...LEXEMES, 'free-opou': { ...(LEXEMES['free-opou'] as GreekFreeRelative), examples: { ever: { el: '', ro: 'x', en: 'x' }, plain: { el: 'x', ro: 'x', en: 'x' } } } };
    expect(validate({ lexemes: noExample, phrases: [] })).toContain('lexeme free-opou: an empty Romanian, English, meaning or example text');
  });
});
