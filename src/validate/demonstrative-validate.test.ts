import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { Phrase, Token } from '../types';
import { validate } from './validate';

const find = (id: string) => PHRASES.find((p) => p.id === id)!;
const withTokens = (base: Phrase, change: (tokens: Token[]) => Token[]): Phrase => ({ ...base, tokens: change(base.tokens.map((t) => ({ ...t }))) });
const errorsOf = (p: Phrase) => validate({ lexemes: LEXEMES, phrases: [p] });

describe('a demonstrative in the validator', () => {
  it('accepts the real phrases', () => {
    for (const id of ['this-house', 'that-dog', 'these-houses', 'this-is-my-house', 'such-a-house', 'so-much-bread']) {
      expect(errorsOf(find(id))).toEqual([]);
    }
  });

  it('wants the definite article of the noun after αυτός and εκείνος', () => {
    const noArticle = withTokens(find('this-house'), (t) => [t[0], t[2]].map((x) => ({ ...x, agreesWith: x.agreesWith === 2 ? 1 : x.agreesWith })));
    expect(errorsOf(noArticle)).toContain('this-house token 0 (Αυτό): αυτός beside a noun needs the definite article of that noun');
    const far = withTokens(find('that-dog'), (t) => [t[0], t[2]].map((x) => ({ ...x, agreesWith: x.agreesWith === 2 ? 1 : x.agreesWith })));
    expect(errorsOf(far)).toContain('that-dog token 0 (Εκείνος): εκείνος beside a noun needs the definite article of that noun');
  });

  it('wants ένα before τέτοιος in the singular, and none in the plural', () => {
    const noOne = withTokens(find('such-a-house'), (t) => [t[1], t[2]].map((x) => ({ ...x, agreesWith: 1 })));
    expect(errorsOf(noOne)).toContain('such-a-house token 0 (τέτοιο): τέτοιος in the singular needs ένα before it');
    const plural: Phrase = {
      ...find('such-a-house'),
      tokens: [
        { text: 'τέτοια', lexeme: 'tetoios', slot: { pos: 'quantifier', gender: 'n', number: 'pl', case: 'nom', degree: 'plain', use: 'determiner' }, agreesWith: 1 },
        { text: 'σπίτια', lexeme: 'spiti', slot: { pos: 'noun', number: 'pl', case: 'nom' } },
      ],
      glosses: (['en', 'ro'] as const).flatMap((language) =>
        (['natural', 'literal'] as const).map((kind) => ({ language, kind, units: [{ text: 'a', link: 0 }, { text: 'b', link: 1 }] })),
      ),
    };
    expect(errorsOf(plural)).toEqual([]);
  });

  it('τόσος needs no article, and a pronoun use needs none either', () => {
    const noArticle = errorsOf(find('so-much-bread'));
    expect(noArticle).toEqual([]);
  });

  it('the spoken register is not part of a Greek token', () => {
    const spoken = withTokens(find('this-house'), (t) => t.map((x, i) => (i === 0 ? { ...x, slot: { ...(x.slot as object), register: 'spoken' } as Token['slot'] } : x)));
    expect(errorsOf(spoken)).toContain('this-house token 0 (Αυτό): the spoken register is a Romanian form, not part of a Greek token');
  });

  it('checks the form: the genders of the demonstrative and its noun must agree', () => {
    const wrong = withTokens(find('this-house'), (t) => t.map((x, i) => (i === 0 ? { ...x, text: 'Αυτός', slot: { ...(x.slot as object), gender: 'm' } as Token['slot'] } : x)));
    expect(errorsOf(wrong).some((e) => e.includes('slot gender m differs from noun gender n'))).toBe(true);
  });
});
