import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GreekInterrogative } from '../types';
import { slotsFor, validate } from './validate';

const pou = LEXEMES.pou as GreekInterrogative;
const check = (word: GreekInterrogative) => validate({ lexemes: { ...LEXEMES, pou: word }, phrases: [] });

describe('the question words in the validator', () => {
  it('has one slot, and the real data is valid', () => {
    expect(slotsFor(pou)).toEqual([{ pos: 'interrogative' }]);
    expect(check(pou)).toEqual([]);
  });

  it('refuses an empty text', () => {
    expect(check({ ...pou, ro: '' })).toEqual([
      'lexeme pou: an empty Romanian, English, meaning or example text',
    ]);
  });

  it('refuses a fused Romanian word after something that is not a preposition', () => {
    expect(check({ ...pou, roAfter: { thelo: 'de unde' } })).toEqual([
      'lexeme pou: roAfter names "thelo", which is not a preposition',
    ]);
  });
});
