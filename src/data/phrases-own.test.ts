import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = ['my-own-house', 'the-house-is-mine'];
const phrase = (id: string) => {
  const found = PHRASES.find((p) => p.id === id);
  if (!found) throw new Error(`no phrase ${id}`);
  return found;
};
const gloss = (id: string, language: 'en' | 'ro', kind: 'natural' | 'literal') =>
  phrase(id)
    .glosses.find((g) => g.language === language && g.kind === kind)!
    .units.map(unitText)
    .join(' ');
const text = (id: string) => phrase(id).tokens.map((t) => t.text).join(' ');

describe('phrases 69 and 70', () => {
  it('validate against the data, with no gloss warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are unverified, in the Possession theme', () => {
    expect(IDS.map((id) => phrase(id).theme)).toEqual(['Possession', 'Possession']);
    expect(IDS.every((id) => !phrase(id).verified)).toBe(true);
  });

  it('read as the spec says, in the three languages', () => {
    const read = (id: string) => [text(id), gloss(id, 'en', 'natural'), gloss(id, 'ro', 'natural')];
    expect(read('my-own-house')).toEqual(['Το δικό μου σπίτι', 'My own house', 'Propria mea casă']);
    expect(read('the-house-is-mine')).toEqual(['Το σπίτι είναι δικό μου', 'The house is mine', 'Casa este a mea']);
  });

  it('the literal English keeps the Greek order', () => {
    expect(gloss('my-own-house', 'en', 'literal')).toBe('the own my house');
    expect(gloss('the-house-is-mine', 'en', 'literal')).toBe('the house is own my');
  });

  it('δικός and the possessive both point at the noun', () => {
    const own = phrase('my-own-house').tokens;
    expect([own[1].agreesWith, own[2].agreesWith]).toEqual([3, 3]);
    const mine = phrase('the-house-is-mine').tokens;
    expect([mine[3].agreesWith, mine[4].agreesWith]).toEqual([1, 1]);
  });

  it('the noun takes no second accent when the possessive is not next to it', () => {
    expect(phrase('my-own-house').tokens[3].text).toBe('σπίτι');
  });
});
