import { describe, expect, it } from 'vitest';
import { LEXEMES, getVerb } from '../data/lexemes';
import { compose } from '../engine/compose';
import { roVerb } from '../engine/romanian';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

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
const verbToken = (id: string, index: number) => {
  const token = phrase(id).tokens[index];
  if (token.slot.pos !== 'verb') throw new Error('not a verb');
  return { verb: getVerb(token.lexeme), slot: token.slot };
};

describe('phrases 54 to 56', () => {
  it('validate against the data, with no gloss warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('are unverified, in the themes the spec gives', () => {
    const three = ['what-is-it-called', 'lets-eat-it', 'will-you-give-it-to-me'].map(phrase);
    expect(three.map((p) => p.theme)).toEqual(['Daily life', 'Wishes and possibility', 'Daily life']);
    expect(three.every((p) => !p.verified)).toBe(true);
  });

  it('Πώς το λένε; reads "What is it called?", with the literal Romanian cum îl zic', () => {
    expect(phrase('what-is-it-called').tokens.map((t) => t.text).join(' ')).toBe('Πώς το λένε;');
    expect(gloss('what-is-it-called', 'en', 'natural')).toBe('What is it called?');
    expect(gloss('what-is-it-called', 'ro', 'natural')).toBe('Cum se numește?');
    expect(gloss('what-is-it-called', 'ro', 'literal')).toBe('cum îl zic');
    const { verb, slot } = verbToken('what-is-it-called', 1);
    expect(compose(verb, slot).pieces.map((p) => p.kind)).toEqual(['clitic', 'verb']);
    expect(roVerb(verb, slot)).toBe('îl zic');
  });

  it('Ας το φάμε! is "Let\'s eat it!" and Să o mâncăm! (pâine is feminine)', () => {
    expect(gloss('lets-eat-it', 'en', 'natural')).toBe("Let's eat it!");
    expect(gloss('lets-eat-it', 'ro', 'natural')).toBe('Să o mâncăm!');
    const { verb, slot } = verbToken('lets-eat-it', 0);
    expect(compose(verb, slot).pieces.map((p) => p.kind)).toEqual(['particle', 'clitic', 'verb']);
    expect(roVerb(verb, slot)).toBe('să o mâncăm');
  });

  it('Θα μου το δώσεις; has two pronouns, and the Romanian is Mi-o vei da?', () => {
    expect(gloss('will-you-give-it-to-me', 'en', 'natural')).toBe('Will you give it to me?');
    expect(gloss('will-you-give-it-to-me', 'ro', 'natural')).toBe('Mi-o vei da?');
    const { verb, slot } = verbToken('will-you-give-it-to-me', 0);
    expect(compose(verb, slot).pieces.map((p) => p.kind)).toEqual(['particle', 'clitic', 'clitic', 'verb']);
    expect(roVerb(verb, slot)).toBe('mi-o vei da');
  });
});
