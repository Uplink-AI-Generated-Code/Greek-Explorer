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
    // Το δικό σπίτι: the possessive is gone and the noun moves to index 2.
    const gone = withTokens(own, (t) => [{ ...t[0], agreesWith: 2 }, { ...t[1], agreesWith: 2 }, t[3]]);
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

  it('δικός is only nominative or accusative', () => {
    const gen = withTokens(own, (t) => t.map((x, i) => (i === 1 ? { ...x, text: 'δικού', slot: { pos: 'adjective', gender: 'n', number: 'sg', case: 'gen' } as Token['slot'] } : x)));
    expect(errorsOf(gen).some((e) => e.includes('δικός is offered only as subject or object'))).toBe(true);
  });

  it('δικός agrees with its noun in number and in role', () => {
    const plural = withTokens(own, (t) => t.map((x, i) => (i === 1 ? { ...x, slot: { pos: 'adjective', gender: 'n', number: 'pl', case: 'nom' } as Token['slot'] } : x)));
    expect(errorsOf(plural).some((e) => e.includes('δικός is pl but its noun is sg'))).toBe(true);
    const acc = withTokens(own, (t) => t.map((x, i) => (i === 1 ? { ...x, slot: { pos: 'adjective', gender: 'n', number: 'sg', case: 'acc' } as Token['slot'] } : x)));
    expect(errorsOf(acc).some((e) => e.includes('δικός is acc but its noun is nom'))).toBe(true);
  });

  it('δικός does not stand straight after its noun (σπίτι δικό μου)', () => {
    const [the, house, , dikos, possessive] = mine.tokens;
    const bad: Phrase = { ...mine, tokens: [{ ...the }, { ...house }, { ...dikos }, { ...possessive }] };
    expect(errorsOf(bad).some((e) => e.includes('not straight after the noun'))).toBe(true);
  });

  it('the article of a noun possessor is genitive singular, and a noun has one possessor only', () => {
    const child = PHRASES.find((p) => p.tokens.some((t) => t.slot.pos === 'noun' && t.slot.case === 'gen' && t.agreesWith !== undefined))!;
    expect(errorsOf(child)).toEqual([]);
    const at = child.tokens.findIndex((t) => t.slot.pos === 'noun' && t.slot.case === 'gen' && t.agreesWith !== undefined);
    const wrong = withTokens(child, (t) => t.map((x, i) => (i === at - 1 ? { ...x, slot: { ...x.slot, case: 'nom' } as Token['slot'] } : x)));
    expect(errorsOf(wrong).some((e) => e.includes('article of a noun possessor is the genitive singular'))).toBe(true);
    const twice = withTokens(child, (t) => [...t, { ...t[at - 1], agreesWith: t.length + 1 }, { ...t[at], agreesWith: t[at].agreesWith }]);
    expect(errorsOf(twice).some((e) => e.includes('only one noun possessor'))).toBe(true);
  });
});
