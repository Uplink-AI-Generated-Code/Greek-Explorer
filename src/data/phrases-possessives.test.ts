import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = ['my-house', 'our-sea', 'your-dog', 'his-child', 'where-is-your-house', 'my-hot-coffee'];
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

describe('phrases 63 to 68', () => {
  it('validate against the data, with no gloss warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are unverified, in the Possession theme', () => {
    expect(IDS.map((id) => phrase(id).theme)).toEqual(IDS.map(() => 'Possession'));
    expect(IDS.every((id) => !phrase(id).verified)).toBe(true);
  });

  it('read as the spec says, in the three languages', () => {
    const read = (id: string) => [text(id), gloss(id, 'en', 'natural'), gloss(id, 'ro', 'natural')];
    expect(read('my-house')).toEqual(['Το σπίτι μου', 'My house', 'Casa mea']);
    expect(read('our-sea')).toEqual(['Η θάλασσά μας', 'Our sea', 'Marea noastră']);
    expect(read('your-dog')).toEqual(['Ο σκύλος σου', 'Your dog', 'Câinele tău']);
    expect(read('his-child')).toEqual(['Το παιδί του', 'His child', 'Copilul lui']);
    expect(read('where-is-your-house')).toEqual(['Πού είναι το σπίτι σου;', 'Where is your house?', 'Unde este casa ta?']);
    expect(read('my-hot-coffee')).toEqual(['Ο ζεστός καφές μου', 'My hot coffee', 'Cafeaua mea caldă']);
  });

  it('the literal English follows the Greek order: the house my', () => {
    expect(gloss('my-house', 'en', 'literal')).toBe('the house my');
    expect(gloss('my-hot-coffee', 'en', 'literal')).toBe('the hot coffee my');
  });

  it('every possessive token points at the noun it belongs to, and the noun carries the second accent', () => {
    for (const id of IDS) {
      const tokens = phrase(id).tokens;
      const index = tokens.findIndex((t) => t.lexeme === 'possessive');
      expect(tokens[tokens[index].agreesWith!].slot.pos).toBe('noun');
    }
    expect(phrase('our-sea').tokens[1].text).toBe('θάλασσά');
  });
});
