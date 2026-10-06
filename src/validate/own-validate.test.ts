import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { Phrase, Token } from '../types';
import { validate } from './validate';

const own = PHRASES.find((p) => p.id === 'my-own-house')!;
const mine = PHRASES.find((p) => p.id === 'the-house-is-mine')!;
const withTokens = (base: Phrase, change: (tokens: Token[]) => Token[]): Phrase => ({ ...base, tokens: change(base.tokens.map((t) => ({ ...t }))) });
const errorsOf = (p: Phrase) => validate({ lexemes: LEXEMES, phrases: [p] });

describe('δικός in the validator', () => {
  it('accepts both real phrases', () => {
    expect(errorsOf(own)).toEqual([]);
    expect(errorsOf(mine)).toEqual([]);
  });

  it('wants the possessive of the same noun directly after δικός', () => {
    const gone = withTokens(own, (t) => [t[0], t[1], t[3]].map((x, i) => (i === 2 ? { ...x } : x)).map((x) => ({ ...x, agreesWith: x.agreesWith === 3 ? 2 : x.agreesWith })));
    expect(errorsOf(gone).some((e) => e.includes('δικός needs the possessive of the same noun directly after it'))).toBe(true);
    const other = withTokens(mine, (t) => t.map((x, i) => (i === 4 ? { ...x, agreesWith: 0 } : x)));
    expect(errorsOf(other).some((e) => e.includes('δικός needs the possessive'))).toBe(true);
  });

  it('a possessive before its noun is wrong unless δικός comes just before it', () => {
    const swapped = withTokens(own, (t) => [t[0], t[2], t[1], t[3]]);
    expect(errorsOf(swapped).some((e) => e.includes('comes after its noun'))).toBe(true);
  });

  it('wants the noun’s agreement, the gender of δικός and the form of its text', () => {
    const gender = withTokens(own, (t) => t.map((x, i) => (i === 1 ? { ...x, slot: { pos: 'adjective', gender: 'm', number: 'sg', case: 'nom' } as Token['slot'] } : x)));
    expect(errorsOf(gender).some((e) => e.includes('slot gender m differs from noun gender n'))).toBe(true);
  });

  it('asks for no second accent on a noun with a possessive that is not next to it', () => {
    const sea = withTokens(own, (t) => t.map((x, i) => (i === 3 ? { ...x, text: 'θάλασσα', lexeme: 'thalassa' } : i === 0 ? { ...x, slot: { pos: 'article', gender: 'f', number: 'sg', case: 'nom' } as Token['slot'] } : i === 1 ? { ...x, text: 'δική', slot: { pos: 'adjective', gender: 'f', number: 'sg', case: 'nom' } as Token['slot'] } : x)));
    expect(errorsOf(sea).filter((e) => e.includes('before the possessive'))).toEqual([]);
  });
});
