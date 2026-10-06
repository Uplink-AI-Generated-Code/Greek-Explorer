import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = ['this-house', 'that-dog', 'these-houses', 'this-is-my-house', 'here-is-the-house', 'as-far-as-there', 'such-a-house', 'so-much-bread'];
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

describe('phrases 73 to 80', () => {
  it('validate against the data, with no gloss warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are unverified, in the Pointing theme', () => {
    expect(IDS.map((id) => phrase(id).theme)).toEqual(IDS.map(() => 'Pointing'));
    expect(IDS.every((id) => !phrase(id).verified)).toBe(true);
  });

  it('read as the spec says, in the three languages', () => {
    const read = (id: string) => [text(id), gloss(id, 'en', 'natural'), gloss(id, 'ro', 'natural')];
    expect(read('this-house')).toEqual(['Αυτό το σπίτι', 'This house', 'Această casă']);
    expect(read('that-dog')).toEqual(['Εκείνος ο σκύλος', 'That dog', 'Acel câine']);
    expect(read('these-houses')).toEqual(['Αυτά τα σπίτια', 'These houses', 'Casele acestea']);
    expect(read('this-is-my-house')).toEqual(['Αυτό είναι το σπίτι μου', 'This is my house', 'Aceasta este casa mea']);
    expect(read('here-is-the-house')).toEqual(['Εδώ είναι το σπίτι', 'Here is the house', 'Aici este casa']);
    expect(read('as-far-as-there')).toEqual(['Μέχρι εκεί', 'Until there', 'Până acolo']);
    expect(read('such-a-house')).toEqual(['Ένα τέτοιο σπίτι', 'Such a house', 'O asemenea casă']);
    expect(read('so-much-bread')).toEqual(['Έχω τόσο ψωμί', 'I have so much bread', 'Am atâta pâine']);
  });

  it('the literal English follows the Greek order', () => {
    expect(gloss('this-house', 'en', 'literal')).toBe('this the house');
    expect(gloss('such-a-house', 'en', 'literal')).toBe('a such house');
    expect(gloss('as-far-as-there', 'en', 'literal')).toBe('until there');
  });

  it('the demonstrative points at its noun, and so does its article', () => {
    const tokens = phrase('this-house').tokens;
    expect([tokens[0].agreesWith, tokens[1].agreesWith]).toEqual([2, 2]);
    const pronoun = phrase('this-is-my-house').tokens[0];
    expect(pronoun.slot).toMatchObject({ pos: 'quantifier', use: 'pronoun' });
    expect(pronoun.agreesWith).toBe(3);
  });
});
