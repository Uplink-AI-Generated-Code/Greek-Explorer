import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import { buildPanel, initialState } from '../panels/panels';
import { richText } from '../engine/segments';
import { validate, warnings } from '../validate/validate';
import { DIVERGENCES } from './divergences';
import { LEXEMES } from './lexemes';
import { PHRASES } from './phrases';

const IDS = [
  'want-a-little-water', 'want-some-coffees', 'dont-want-any-coffee',
  'want-more-water', 'eat-less-bread', 'used-to-eat-bread',
];
const byId = (id: string) => {
  const phrase = PHRASES.find((p) => p.id === id);
  if (!phrase) throw new Error(`no phrase ${id}`);
  return phrase;
};

describe('phrases with quantifiers (7, 8, 9, 10, 20, 21)', () => {
  it('validate with no errors and no warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('start unverified and have a theme', () => {
    for (const id of IDS) {
      expect(byId(id).verified).toBe(false);
      expect(byId(id).theme).not.toBe('');
    }
  });

  it.each([
    ['want-a-little-water', ['Θέλω', 'λίγο', 'νερό']],
    ['want-some-coffees', ['Θέλω', 'μερικούς', 'καφέδες']],
    ['dont-want-any-coffee', ['Δεν θέλω', 'κανέναν', 'καφέ']],
    ['want-more-water', ['Θέλω', 'περισσότερο', 'νερό']],
    ['eat-less-bread', ['Θα τρώω', 'λιγότερο', 'ψωμί']],
    ['used-to-eat-bread', ['Έτρωγα', 'πολύ', 'ψωμί']],
  ])('%s has the tokens %j', (id, texts) => {
    expect(byId(id).tokens.map((t) => t.text)).toEqual(texts);
  });

  it('every quantifier token opens a panel whose first row is the quantifier and its noun', () => {
    for (const id of IDS) {
      const phrase = byId(id);
      const index = phrase.tokens.findIndex((t) => t.slot.pos === 'quantifier');
      const token = phrase.tokens[index];
      const noun = phrase.tokens[token.agreesWith as number];
      const panel = buildPanel(initialState(token, phrase), token, 'beginner');
      expect(richText(panel.rows[0].el)).toBe(`${token.text} ${noun.text}`);
    }
  });

  it('phrase 9 negates the verb and uses κανένας in the object role', () => {
    const phrase = byId('dont-want-any-coffee');
    expect(phrase.tokens[0].slot).toMatchObject({ polarity: 'negative' });
    expect(phrase.tokens[1].slot).toMatchObject({ pos: 'quantifier', case: 'acc', number: 'sg', use: 'determiner' });
  });

  it('the comparatives and the senses are on the slot', () => {
    expect(byId('want-more-water').tokens[1].slot).toMatchObject({ degree: 'comparative' });
    expect(byId('eat-less-bread').tokens[1].slot).toMatchObject({ degree: 'comparative' });
    expect(byId('want-some-coffees').tokens[1].slot).not.toHaveProperty('sense');
  });

  it('phrase 20 is the continuous future: θα + the present form', () => {
    expect(byId('eat-less-bread').tokens[0].slot).toMatchObject({ mood: 'indicative', tense: 'future' });
  });
});

describe('the quantifier notes', () => {
  const ids = (lexeme: string, level: 'beginner' | 'improver') =>
    selectDivergences(DIVERGENCES, 'quantifier', lexeme, level).map((d) => d.id);

  it('μερικοί', () => {
    expect(ids('merikoi', 'improver')).toEqual([
      'quantifier-plural-indefinite', 'quantifier-quantity-vs-sense', 'quantifier-determiner-vs-pronoun',
    ]);
    expect(ids('merikoi', 'beginner')).toEqual(['quantifier-plural-indefinite', 'quantifier-determiner-vs-pronoun']);
  });
  it('κάποιος and κανένας', () => {
    expect(ids('kapoios', 'improver')).toEqual(['quantifier-some-vs-any', 'quantifier-determiner-vs-pronoun']);
    expect(ids('kanenas', 'improver')).toEqual(['quantifier-negative-concord', 'quantifier-determiner-vs-pronoun']);
  });
  it('πολύς and λίγος', () => {
    expect(ids('polys', 'improver')).toEqual([
      'quantifier-determiner-vs-pronoun', 'quantifier-count-vs-mass-polys', 'quantifier-comparative-polys',
    ]);
    expect(ids('ligos', 'improver')).toEqual([
      'quantifier-determiner-vs-pronoun', 'quantifier-count-vs-mass-ligos', 'quantifier-comparative-ligos',
    ]);
    expect(ids('ligos', 'beginner')).toEqual(['quantifier-determiner-vs-pronoun', 'quantifier-count-vs-mass-ligos']);
  });
  it('start unverified', () => {
    for (const d of DIVERGENCES.filter((row) => row.id.startsWith('quantifier-'))) expect(d.verified).toBe(false);
  });
});
