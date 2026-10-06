import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { Phrase, Token } from '../types';
import { validate } from './validate';

const base = PHRASES.find((p) => p.id === 'our-sea')!;
const withTokens = (change: (tokens: Token[]) => Token[]): Phrase => ({ ...base, tokens: change(base.tokens.map((t) => ({ ...t }))) });
const errorsOf = (p: Phrase) => validate({ lexemes: LEXEMES, phrases: [p] });

describe('a possessive in the validator', () => {
  it('accepts the real phrase', () => {
    expect(errorsOf(base)).toEqual([]);
  });

  it('wants the second accent on the noun before the possessive', () => {
    const plain = withTokens((t) => t.map((x, i) => (i === 1 ? { ...x, text: 'θάλασσα' } : x)));
    expect(errorsOf(plain)).toContain('our-sea token 1 (θάλασσα): text differs from the form before the possessive ("θάλασσά")');
  });

  it('wants the pronoun that the possessor says', () => {
    const wrong = withTokens((t) => t.map((x, i) => (i === 2 ? { ...x, text: 'μου' } : x)));
    expect(errorsOf(wrong)).toContain('our-sea token 2 (μου): text differs from the possessive ("μας")');
  });

  it('wants a noun in agreesWith', () => {
    const none = withTokens((t) => t.map((x, i) => (i === 2 ? { ...x, agreesWith: undefined } : x)));
    expect(errorsOf(none)).toContain('our-sea token 2 (μας): a possessive needs agreesWith pointing at the noun it belongs to');
    const article = withTokens((t) => t.map((x, i) => (i === 2 ? { ...x, agreesWith: 0 } : x)));
    expect(errorsOf(article)).toContain('our-sea token 2 (μας): a possessive needs agreesWith pointing at the noun it belongs to');
  });

  it('leaves a noun with no possessive alone, whatever its accent', () => {
    const alone = withTokens((t) => t.slice(0, 2).map((x, i) => (i === 1 ? { ...x, text: 'θάλασσα' } : x)));
    expect(errorsOf(alone).filter((e) => e.includes('before the possessive'))).toEqual([]);
  });
});
