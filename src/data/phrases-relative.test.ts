import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = [
  'the-dog-that-jumps', 'the-bread-that-i-ate', 'the-coffee-i-want', 'the-child-i-gave-it-to', 'the-child-whose-dog-jumps',
  'the-house-i-am-going-to', 'the-child-i-am-going-with', 'the-dog-that-is-there', 'this-is-the-house-i-have',
];
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

describe('phrases 81 to 89', () => {
  it('validate against the data, with no gloss warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are unverified, in the Relative clauses theme', () => {
    expect(IDS.map((id) => phrase(id).theme)).toEqual(IDS.map(() => 'Relative clauses'));
    expect(IDS.every((id) => !phrase(id).verified)).toBe(true);
  });

  it('read as the spec says, in the three languages', () => {
    const read = (id: string) => [text(id), gloss(id, 'en', 'natural'), gloss(id, 'ro', 'natural')];
    expect(read('the-dog-that-jumps')).toEqual(['Ο σκύλος που πηδάει', 'The dog that jumps', 'Câinele care sare']);
    expect(read('the-bread-that-i-ate')).toEqual(['Το ψωμί που έφαγα', 'The bread that I ate', 'Pâinea pe care am mâncat-o']);
    expect(read('the-coffee-i-want')).toEqual(['Ο καφές που θέλω', 'The coffee I want', 'Cafeaua pe care o vreau']);
    expect(read('the-child-i-gave-it-to')).toEqual(['Το παιδί που του το έδωσα', 'The child I gave it to', 'Copilul căruia i l-am dat']);
    expect(read('the-child-whose-dog-jumps')).toEqual(['Το παιδί του οποίου ο σκύλος πηδάει', 'The child whose dog jumps', 'Copilul al cărui câine sare']);
    expect(read('the-house-i-am-going-to')).toEqual(['Το σπίτι στο οποίο πάω', 'The house I am going to', 'Casa la care merg']);
    expect(read('the-child-i-am-going-with')).toEqual(['Το παιδί με το οποίο πάω', 'The child I am going with', 'Copilul cu care merg']);
    expect(read('the-dog-that-is-there')).toEqual(['Ο σκύλος που είναι εκεί', 'The dog that is there', 'Câinele care este acolo']);
    expect(read('this-is-the-house-i-have')).toEqual(['Αυτό είναι το σπίτι που έχω', 'This is the house that I have', 'Aceasta este casa pe care o am']);
  });

  it('English leaves the pronoun out of "the coffee I want", and the literal row keeps it', () => {
    expect(gloss('the-coffee-i-want', 'en', 'natural')).not.toContain('that');
    expect(gloss('the-coffee-i-want', 'en', 'literal')).toContain('that');
  });

  it('the relative pronoun points at its noun, and "whose" is followed by the article and the noun owned', () => {
    expect(phrase('the-dog-that-jumps').tokens[2].agreesWith).toBe(1);
    expect(phrase('this-is-the-house-i-have').tokens[4].agreesWith).toBe(3);
    const whose = phrase('the-child-whose-dog-jumps').tokens;
    expect(whose[2].slot).toMatchObject({ pos: 'relative', role: 'whose' });
    expect([whose[3].lexeme, whose[4].lexeme]).toEqual(['def', 'skylos']);
  });
});
