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

describe('a possessive in the validator: reports instead of throwing, and checks the shape', () => {
  const poss = (i: number, slot: Record<string, unknown>) => (t: Token[]) => t.map((x, k) => (k === i ? ({ ...x, slot } as Token) : x));
  const house = PHRASES.find((p) => p.id === 'my-house')!;
  const houseWith = (change: (tokens: Token[]) => Token[]): Phrase => ({ ...house, tokens: change(house.tokens.map((t) => ({ ...t }))) });

  it('reports a third person singular with no gender', () => {
    const p = houseWith(poss(2, { pos: 'possessive', person: 3, number: 'sg' }));
    expect(() => errorsOf(p)).not.toThrow();
    expect(errorsOf(p).length).toBeGreaterThan(0);
  });

  it('rejects a possessor the app does not offer (3sg.n)', () => {
    const p = houseWith(poss(2, { pos: 'possessive', person: 3, number: 'sg', gender: 'n' }));
    expect(errorsOf(p).some((e) => e.includes('not one the app offers'))).toBe(true);
  });

  it('wants the possessive after its noun, directly after it, and the noun with the definite article', () => {
    const before = houseWith((t) => [t[0], { ...t[2], agreesWith: 2 }, t[1]].map((x, i) => (i === 1 ? { ...x, agreesWith: 2 } : x)));
    expect(errorsOf(before).some((e) => e.includes('comes after its noun'))).toBe(true);
    const noArticle = houseWith((t) => t.slice(1).map((x) => ({ ...x, agreesWith: x.agreesWith === undefined ? undefined : x.agreesWith - 1 })));
    expect(errorsOf(noArticle).some((e) => e.includes('needs the definite article'))).toBe(true);
    const apart = PHRASES.find((p) => p.id === 'my-hot-coffee')!;
    const moved: Phrase = { ...apart, tokens: apart.tokens.map((t, i) => (i === 3 ? { ...t, agreesWith: 2 } : { ...t })) };
    expect(errorsOf(moved)).toEqual([]);
    const gap: Phrase = { ...apart, tokens: apart.tokens.map((t, i) => (i === 3 ? { ...t, agreesWith: 2 } : { ...t })) };
    gap.tokens.splice(3, 0, { text: 'καλός', lexeme: 'zestos', slot: { pos: 'adjective', gender: 'm', number: 'sg', case: 'nom' }, agreesWith: 2 });
    expect(errorsOf(gap).some((e) => e.includes('directly after'))).toBe(true);
  });
});
