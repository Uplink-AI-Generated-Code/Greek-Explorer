import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { Phrase, Token } from '../types';
import { validate, warnings } from './validate';

const house = PHRASES.find((p) => p.id === 'the-childs-house')!;
const withTokens = (change: (tokens: Token[]) => Token[]): Phrase => ({ ...house, tokens: change(house.tokens.map((t) => ({ ...t }))) });
const errorsOf = (p: Phrase) => validate({ lexemes: LEXEMES, phrases: [p] });

describe('a noun possessor in the validator', () => {
  it('accepts both real phrases', () => {
    expect(errorsOf(house)).toEqual([]);
    expect(errorsOf(PHRASES.find((p) => p.id === 'the-childs-dog')!)).toEqual([]);
  });

  it('wants the genitive singular', () => {
    const acc = withTokens((t) => t.map((x, i) => (i === 3 ? { ...x, slot: { pos: 'noun', number: 'sg', case: 'acc' } as Token['slot'] } : x)));
    expect(errorsOf(acc)).toContain('the-childs-house token 3 (παιδιού): a noun possessor is the genitive singular');
  });

  it('wants it right after the possessed noun and its own article', () => {
    const far = withTokens((t) => [t[0], t[1], t[0], t[2], t[3]].map((x, i) => (i === 4 ? { ...x, agreesWith: 1 } : x)).map((x, i) => (i === 3 ? { ...x, agreesWith: 4 } : x)));
    expect(errorsOf(far).some((e) => e.includes('comes after its noun and its own article'))).toBe(true);
  });

  it('wants the definite article just before it', () => {
    const none = withTokens((t) => [t[0], t[1], { ...t[3], agreesWith: 1 }]);
    expect(errorsOf(none).some((e) => e.includes('needs the definite article just before it'))).toBe(true);
  });

  it('wants the possessed noun to have its definite article too', () => {
    const noArticle = withTokens((t) => t.slice(1).map((x) => ({ ...x, agreesWith: x.agreesWith === undefined ? undefined : x.agreesWith - 1 })));
    expect(errorsOf(noArticle).some((e) => e.includes('the noun of a noun possessor needs the definite article'))).toBe(true);
  });

  it('wants agreesWith to point at a noun', () => {
    const pointing = withTokens((t) => t.map((x, i) => (i === 3 ? { ...x, agreesWith: 0 } : x)));
    expect(errorsOf(pointing)).toContain('the-childs-house token 3 (παιδιού): a noun possessor needs agreesWith pointing at the noun it belongs to');
  });

  it('checks the Romanian genitive split against the noun data', () => {
    const bad: Phrase = {
      ...house,
      glosses: house.glosses.map((g) =>
        g.language === 'ro' && g.kind === 'natural'
          ? { ...g, units: [g.units[0], { segments: [{ text: 'copil', link: 3 }, { text: 'ul', link: 2 }] }] }
          : g,
      ),
    };
    expect(warnings({ lexemes: LEXEMES, phrases: [bad] })).toEqual([
      'the-childs-house gloss ro/natural: "copilul" is split copil + ul, the noun data has the genitive copilului',
    ]);
    expect(warnings({ lexemes: LEXEMES, phrases: [house] })).toEqual([]);
  });
});
