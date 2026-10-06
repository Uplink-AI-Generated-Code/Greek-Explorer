import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { unitText } from '../glossLinks';
import { validate, warnings } from '../validate/validate';
import { PHRASES } from './phrases';

const IDS = ['whatever-you-want', 'wherever-you-go', 'whoever-wants', 'what-i-have', 'there-where-the-house-is'];
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

describe('phrases 90 to 94', () => {
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
    expect(read('whatever-you-want')).toEqual(['Ό,τι θέλεις', 'Whatever you want', 'Orice vrei']);
    expect(read('wherever-you-go')).toEqual(['Όπου πας', 'Wherever you go', 'Oriunde mergi']);
    expect(read('whoever-wants')).toEqual(['Όποιος θέλει', 'Whoever wants', 'Oricine vrea']);
    expect(read('what-i-have')).toEqual(['Ό,τι έχω', 'What I have', 'Ce am']);
    expect(read('there-where-the-house-is')).toEqual(['Εκεί όπου είναι το σπίτι', 'There where the house is', 'Acolo unde este casa']);
  });

  it('the same Greek word has two Romanian words: ό,τι is orice and ce, όπου is oriunde and unde', () => {
    expect(gloss('whatever-you-want', 'ro', 'natural')).toContain('Orice');
    expect(gloss('what-i-have', 'ro', 'natural')).toContain('Ce');
    expect(gloss('wherever-you-go', 'ro', 'natural')).toContain('Oriunde');
    expect(gloss('there-where-the-house-is', 'ro', 'natural')).toContain('unde');
  });

  it('όποιος stands on its own, with no noun to agree with', () => {
    const token = phrase('whoever-wants').tokens[0];
    expect(token.slot).toMatchObject({ pos: 'quantifier', use: 'pronoun', gender: 'm', case: 'nom' });
    expect(token.agreesWith).toBeUndefined();
  });
});
