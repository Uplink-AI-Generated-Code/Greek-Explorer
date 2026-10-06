import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GlossRow, Phrase, Token } from '../types';
import { validate } from './validate';

const rows = (link: GlossRow['units'][number]): GlossRow[] => [
  { language: 'en', kind: 'natural', units: [link] },
  { language: 'en', kind: 'literal', units: [link] },
  { language: 'ro', kind: 'natural', units: [link] },
  { language: 'ro', kind: 'literal', units: [link] },
];
const phrase = (se: Partial<Token>, link: GlossRow['units'][number] = { text: 'on', link: { token: 0, piece: 0 } }): Phrase => ({
  id: 'p',
  title: 'p',
  theme: 'Places',
  level: 'beginner',
  tokens: [
    { text: 'στον', lexeme: 'se', slot: { pos: 'preposition', sense: 'on' }, agreesWith: 1, ...se },
    { text: 'σκύλο', lexeme: 'skylos', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(link),
  verified: false,
});
const errorsOf = (p: Phrase) => validate({ lexemes: LEXEMES, phrases: [p] });

describe('a fused preposition token in the validator', () => {
  it('accepts στον before a masculine noun, with a link to either part', () => {
    expect(errorsOf(phrase({}))).toEqual([]);
    expect(errorsOf(phrase({}, { text: 'the', link: { token: 0, piece: 1 } }))).toEqual([]);
  });

  it('refuses a text that is not the fused form of the noun', () => {
    expect(errorsOf(phrase({ text: 'στο' }))).toContain('p token 0 (στο): text differs from the fused form ("στον")');
  });

  it('refuses a sense σε does not have', () => {
    const bad = phrase({ slot: { pos: 'preposition', sense: 'above' as never } });
    expect(errorsOf(bad)).toContain('p token 0 (στον): σε has no sense "above"');
  });

  it('refuses a link to a third part, and a link to a part of a preposition that does not fuse', () => {
    expect(errorsOf(phrase({}, { text: 'x', link: { token: 0, piece: 2 } }))).toContain(
      'p gloss en/natural: unit "x" has piece 2 but token 0 has 2 pieces',
    );
    const plain = phrase({ text: 'από', lexeme: 'apo', slot: { pos: 'preposition' } });
    expect(errorsOf(plain).some((e) => e.includes('which is not a verb group'))).toBe(true);
  });

  it('refuses σε in front of a question word', () => {
    const bad = phrase({ agreesWith: 1 });
    bad.tokens[1] = { text: 'πού', lexeme: 'pou', slot: { pos: 'interrogative' } };
    expect(errorsOf(bad)).toContain('p token 0 (στον): σε fuses with an article, so it needs a noun in agreesWith');
  });
});
