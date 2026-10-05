import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { GreekQuantifier, Phrase, Token } from '../types';
import { validate } from './validate';

const poios = LEXEMES.poios as GreekQuantifier;
const real = { lexemes: LEXEMES, phrases: PHRASES };

/** Phrase 1 with its first token replaced by a ποιος token, which needs no noun. */
const withToken = (patch: Partial<Token>): Phrase => ({
  ...PHRASES[0],
  tokens: PHRASES[0].tokens.map((t, i) =>
    i === 0
      ? {
          text: 'Ποιος',
          lexeme: 'poios',
          slot: { pos: 'quantifier', gender: 'm', number: 'sg', case: 'nom', degree: 'plain', use: 'pronoun' },
          ...patch,
        }
      : t,
  ),
});

describe('question-word quantifiers in the validator', () => {
  it('accepts the real data', () => {
    expect(validate({ ...real, phrases: [] })).toEqual([]);
  });

  it('accepts ποιος on its own with no noun', () => {
    expect(validate({ ...real, phrases: [withToken({})] })).toEqual([]);
  });

  it('still wants a noun when ποιος stands beside one', () => {
    const phrase = withToken({ slot: { pos: 'quantifier', gender: 'm', number: 'sg', case: 'nom', degree: 'plain', use: 'determiner' } });
    expect(validate({ ...real, phrases: [phrase] })).toContain(
      'ordering-hot-coffee token 0 (Ποιος): quantifier needs agreesWith pointing at a noun',
    );
  });

  it('refuses the genitive in a token and in the lexeme data', () => {
    const token = withToken({ text: 'ποιου', slot: { pos: 'quantifier', gender: 'm', number: 'sg', case: 'gen', degree: 'plain', use: 'pronoun' } });
    expect(validate({ ...real, phrases: [token] })).toContain('ordering-hot-coffee token 0 (ποιου): poios does not offer the gen role');
    const wide: GreekQuantifier = { ...poios, cases: ['nom', 'acc', 'gen'] };
    expect(validate({ lexemes: { ...LEXEMES, poios: wide }, phrases: [] })).toContain(
      'lexeme poios: a question word offers the subject and object roles only',
    );
  });
});

describe('a preposition before a question word', () => {
  const withPreposition = (target: string, slot: Token['slot']): Phrase => ({
    ...PHRASES[0],
    tokens: [
      { text: 'από', lexeme: 'apo', slot: { pos: 'preposition' }, agreesWith: 1 },
      { text: 'x', lexeme: target, slot },
    ],
  });

  it('accepts a question word after the preposition', () => {
    const phrase = withPreposition('pou', { pos: 'interrogative' });
    expect(validate({ ...real, phrases: [phrase] }).filter((e) => e.includes('token 0'))).toEqual([]);
  });

  it('refuses a verb after the preposition', () => {
    const phrase = withPreposition('thelo', {
      pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active',
    });
    expect(validate({ ...real, phrases: [phrase] })).toContain(
      'ordering-hot-coffee token 0 (από): preposition needs agreesWith pointing at the noun or question word it governs',
    );
  });
});
