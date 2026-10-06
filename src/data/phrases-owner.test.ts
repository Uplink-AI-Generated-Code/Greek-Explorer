import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = ['the-childs-house', 'the-childs-dog'];
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

describe('phrases 71 and 72', () => {
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
    expect(read('the-childs-house')).toEqual(['Το σπίτι του παιδιού', "The child's house", 'Casa copilului']);
    expect(read('the-childs-dog')).toEqual(['Ο σκύλος του παιδιού', "The child's dog", 'Câinele copilului']);
  });

  it('the literal English says "of the": the house of the child', () => {
    expect(gloss('the-childs-house', 'en', 'literal')).toBe('the house of the child');
    expect(gloss('the-childs-dog', 'en', 'literal')).toBe('the dog of the child');
  });

  it('the possessor noun points back at the noun it belongs to', () => {
    expect(phrase('the-childs-house').tokens[3].agreesWith).toBe(1);
    expect(phrase('the-childs-dog').tokens[3].agreesWith).toBe(1);
  });
});
