import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { GreekAdverb, GreekLexeme, Phrase, Slot } from '../types';
import { validate } from './validate';

const real = { lexemes: LEXEMES };
const withPreposition = (prep: string, target: string, slot: Slot): Phrase => ({
  ...PHRASES[0],
  tokens: [
    { text: prep === 'se' ? 'στο' : 'από', lexeme: prep, slot: { pos: 'preposition' }, agreesWith: 1 },
    { text: 'x', lexeme: target, slot },
  ],
});
const edo = LEXEMES.edo as GreekAdverb;
const lexemesWith = (change: Partial<GreekAdverb>): Record<string, GreekLexeme> => ({ ...LEXEMES, edo: { ...edo, ...change } });

describe('the place words in the validator', () => {
  it('the real lexemes are valid', () => {
    expect(validate({ ...real, phrases: [] })).toEqual([]);
  });

  it('accepts a place word after a preposition', () => {
    const phrase = withPreposition('apo', 'edo', { pos: 'adverb' });
    expect(validate({ ...real, phrases: [phrase] }).filter((e) => e.includes('token 0'))).toEqual([]);
  });

  it('σε fuses with an article, so it does not take a place word', () => {
    const phrase = withPreposition('se', 'edo', { pos: 'adverb' });
    expect(validate({ ...real, phrases: [phrase] })).toContain(
      'ordering-hot-coffee token 0 (στο): σε fuses with an article, so it needs a noun in agreesWith',
    );
  });

  it('wants the texts to be filled in, and roAfter to name a preposition', () => {
    expect(validate({ lexemes: lexemesWith({ ro: '' }), phrases: [] })).toContain('lexeme edo: an empty Romanian, English, meaning or example text');
    expect(validate({ lexemes: lexemesWith({ roAfter: { pou: 'de aici' } }), phrases: [] })).toContain(
      'lexeme edo: roAfter names "pou", which is not a preposition',
    );
    expect(validate({ lexemes: lexemesWith({ roAfter: { apo: '' } }), phrases: [] })).toContain('lexeme edo: roAfter for apo is empty');
  });
});
