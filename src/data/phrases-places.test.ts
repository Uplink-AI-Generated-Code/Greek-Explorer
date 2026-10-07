import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = ['going-home', 'at-home', 'go-to-the-sea', 'dog-on-the-road', 'give-bread-to-the-child', 'dog-jumps-into-the-water'];
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

describe('phrases 57 to 62', () => {
  it('validate against the data, with no gloss warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are unverified, in the themes the spec gives', () => {
    expect(IDS.map((id) => phrase(id).theme)).toEqual(['Places', 'Places', 'Places', 'Places', 'Daily life', 'Places']);
    expect(IDS.every((id) => !phrase(id).verified)).toBe(true);
  });

  it('read as the spec says, in the three languages', () => {
    const read = (id: string) => [text(id), gloss(id, 'en', 'natural'), gloss(id, 'ro', 'natural')];
    expect(read('going-home')).toEqual(['Πάω στο σπίτι', "I'm going home", 'Merg acasă']);
    expect(read('at-home')).toEqual(['Είμαι στο σπίτι', "I'm at home", 'Sunt acasă']);
    expect(read('go-to-the-sea')).toEqual(['Πάμε στη θάλασσα;', 'Shall we go to the sea?', 'Mergem la mare?']);
    expect(read('dog-on-the-road')).toEqual(['Ο σκύλος είναι στον δρόμο', 'The dog is on the road', 'Câinele este pe drum']);
    expect(read('give-bread-to-the-child')).toEqual(['Δίνω το ψωμί στο παιδί', 'I give the bread to the child', 'Dau pâinea copilului']);
    expect(read('dog-jumps-into-the-water')).toEqual(['Ο σκύλος πηδάει στο νερό', 'The dog jumps into the water', 'Câinele sare în apă']);
  });

  it('use each meaning of σε once or more: to, at, in, on and a person', () => {
    const senses = IDS.flatMap((id) => phrase(id).tokens.flatMap((t) => (t.slot.pos === 'preposition' && t.slot.sense ? [t.slot.sense] : [])));
    expect(senses).toEqual(['to', 'at', 'to', 'on', 'person', 'in']);
  });

  it('write the fused word as one token that points at its noun', () => {
    for (const id of IDS) {
      const index = phrase(id).tokens.findIndex((t) => t.lexeme === 'se');
      const token = phrase(id).tokens[index];
      expect(token.agreesWith).toBe(index + 1);
      expect(phrase(id).tokens[token.agreesWith!].slot.pos).toBe('noun');
    }
    expect(['στο', 'στο', 'στη', 'στον', 'στο', 'στο']).toEqual(IDS.map((id) => phrase(id).tokens.find((t) => t.lexeme === 'se')!.text));
  });

  it('link the literal English to both parts of the fused word (to + the)', () => {
    const units = phrase('going-home').glosses[1].units;
    const links = units.flatMap((u) => ('link' in u && u.link !== null && typeof u.link === 'object' ? [u.link] : []));
    expect(links).toEqual([{ token: 1, piece: 0 }, { token: 1, piece: 1 }]);
  });

  it('the dative of a person: Romanian drops the preposition, the literal row shows it', () => {
    expect(gloss('give-bread-to-the-child', 'ro', 'literal')).toBe('(eu) dau pâinea la copil');
  });
});
