import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { Phrase, Token } from '../types';
import { validate } from './validate';

const find = (id: string) => PHRASES.find((p) => p.id === id)!;
const withToken = (base: Phrase, i: number, change: (t: Token) => Token): Phrase => ({ ...base, tokens: base.tokens.map((t, k) => (k === i ? change({ ...t }) : { ...t })) });
const errorsOf = (p: Phrase) => validate({ lexemes: LEXEMES, phrases: [p] });
const rel = (patch: Record<string, unknown>) => (t: Token) => ({ ...t, slot: { ...(t.slot as object), ...patch } as Token['slot'] });

describe('a relative pronoun in the validator', () => {
  it('accepts the real phrases', () => {
    for (const id of ['the-dog-that-jumps', 'the-bread-that-i-ate', 'the-child-i-gave-the-bread-to', 'the-child-whose-dog-jumps', 'the-house-i-am-going-to', 'the-child-i-am-going-with', 'this-is-the-house-i-have']) {
      expect(errorsOf(find(id))).toEqual([]);
    }
  });

  it('wants agreesWith to point at a noun, directly before it, with the same gender and number', () => {
    const dog = find('the-dog-that-jumps');
    expect(errorsOf(withToken(dog, 2, (t) => ({ ...t, agreesWith: undefined })))).toContain('the-dog-that-jumps token 2 (που): a relative pronoun needs agreesWith pointing at the noun it refers to');
    expect(errorsOf(withToken(dog, 2, (t) => ({ ...t, agreesWith: 0 })))).toContain('the-dog-that-jumps token 2 (που): a relative pronoun needs agreesWith pointing at the noun it refers to');
    expect(errorsOf(withToken(dog, 2, rel({ gender: 'f' })))).toContain('the-dog-that-jumps token 2 (που): slot gender f differs from noun gender m');
    expect(errorsOf(withToken(dog, 2, rel({ number: 'pl' })))).toContain('the-dog-that-jumps token 2 (που): the relative pronoun is pl but its noun is sg');
    const apart = { ...dog, tokens: [dog.tokens[0], dog.tokens[1], dog.tokens[3], dog.tokens[2]].map((t, i) => (i === 3 ? { ...t, agreesWith: 1 } : t)) };
    expect(errorsOf(apart).some((e) => e.includes('comes directly after its noun'))).toBe(true);
  });

  it('wants the text the form gives', () => {
    const house = find('the-house-i-am-going-to');
    expect(errorsOf(withToken(house, 2, (t) => ({ ...t, text: 'με το οποίο' })))).toContain('the-house-i-am-going-to token 2 (με το οποίο): text differs from the form ("στο οποίο")');
    expect(errorsOf(withToken(find('the-dog-that-jumps'), 2, (t) => ({ ...t, text: 'οποίος' })))).toContain('the-dog-that-jumps token 2 (οποίος): text differs from the form ("που")');
  });

  it('only the job after a preposition takes a preposition, and only one from the list', () => {
    const house = find('the-house-i-am-going-to');
    expect(errorsOf(withToken(house, 2, rel({ preposition: undefined })))).toContain('the-house-i-am-going-to token 2 (στο οποίο): only the job after a preposition takes a preposition');
    expect(errorsOf(withToken(house, 2, rel({ preposition: 'thelo' })))).toContain('the-house-i-am-going-to token 2 (στο οποίο): thelo is not a preposition a relative pronoun may follow');
    const dog = find('the-dog-that-jumps');
    expect(errorsOf(withToken(dog, 2, rel({ preposition: 'me' }))).some((e) => e.includes('only the job after a preposition takes a preposition'))).toBe(true);
  });

  it('wants "whose" to be followed by the article and the noun owned', () => {
    const whose = find('the-child-whose-dog-jumps');
    const noArticle = { ...whose, tokens: [whose.tokens[0], whose.tokens[1], whose.tokens[2], whose.tokens[4], whose.tokens[5]].map((t, i) => (i === 3 ? { ...t, agreesWith: undefined } : t)) };
    expect(errorsOf(noArticle).some((e) => e.includes('"whose" is followed by the article and the noun owned'))).toBe(true);
  });

  it('που is a token for the subject, the object and "to whom" only', () => {
    const dog = find('the-dog-that-jumps');
    expect(errorsOf(withToken(dog, 2, rel({ role: 'whose' }))).some((e) => e.includes('που is a token for the subject, the object and "to whom"'))).toBe(true);
    expect(errorsOf(withToken(dog, 2, rel({ role: 'preposition', preposition: 'me' }))).some((e) => e.includes('που is a token for the subject'))).toBe(true);
  });
});
