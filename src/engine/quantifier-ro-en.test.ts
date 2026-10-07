import { describe, expect, it } from 'vitest';
import { getLexeme, getNoun } from '../data/lexemes';
import type { GreekQuantifier, SlotOf } from '../types';
import { enQuantifier } from './english';
import { roBareNoun, roQuantifier } from './romanian';

const q = (id: string): GreekQuantifier => {
  const lexeme = getLexeme(id);
  if (lexeme.pos !== 'quantifier') throw new Error(`${id} is not a quantifier`);
  return lexeme;
};
const slot = (patch: Partial<SlotOf<'quantifier'>> = {}): SlotOf<'quantifier'> => ({
  pos: 'quantifier',
  gender: 'm',
  number: 'sg',
  case: 'nom',
  degree: 'plain',
  use: 'determiner',
  ...patch,
});

describe('Romanian quantifier cells', () => {
  it('μερικοί: niște / unor, and câțiva / câteva / câtorva with the few sense', () => {
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl' }), 'm')).toBe('niște');
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', case: 'gen' }), 'f')).toBe('unor');
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', sense: 'few' }), 'm')).toBe('câțiva');
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', sense: 'few' }), 'f')).toBe('câteva');
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', sense: 'few', case: 'gen' }), 'm')).toBe('câtorva');
  });

  it('μερικοί on its own: unii / unele, and no stand-alone genitive', () => {
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', use: 'pronoun' }), 'm')).toBe('unii');
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', use: 'pronoun' }), 'f')).toBe('unele');
    expect(roQuantifier(q('merikoi'), slot({ number: 'pl', use: 'pronoun', case: 'gen' }), 'm')).toBeNull();
  });

  it('κάποιος: un / o, unui / unei, cineva / cuiva (vreun is for questions, negatives and if-clauses)', () => {
    expect(roQuantifier(q('kapoios'), slot(), 'm')).toBe('un');
    expect(roQuantifier(q('kapoios'), slot(), 'f')).toBe('o');
    expect(roQuantifier(q('kapoios'), slot({ case: 'gen' }), 'm')).toBe('unui');
    expect(roQuantifier(q('kapoios'), slot({ case: 'gen' }), 'f')).toBe('unei');
    expect(roQuantifier(q('kapoios'), slot({ use: 'pronoun' }), 'm')).toBe('cineva');
    expect(roQuantifier(q('kapoios'), slot({ use: 'pronoun' }), 'f')).toBe('cineva');
    expect(roQuantifier(q('kapoios'), slot({ use: 'pronoun', case: 'gen' }), 'm')).toBe('cuiva');
  });

  it('κανένας: niciun / nicio, niciunui / niciunei, niciunul / niciuna', () => {
    expect(roQuantifier(q('kanenas'), slot(), 'm')).toBe('niciun');
    expect(roQuantifier(q('kanenas'), slot(), 'f')).toBe('nicio');
    expect(roQuantifier(q('kanenas'), slot({ case: 'gen' }), 'm')).toBe('niciunui');
    expect(roQuantifier(q('kanenas'), slot({ case: 'gen' }), 'f')).toBe('niciunei');
    expect(roQuantifier(q('kanenas'), slot({ use: 'pronoun' }), 'm')).toBe('niciunul');
    expect(roQuantifier(q('kanenas'), slot({ use: 'pronoun' }), 'f')).toBe('niciuna');
  });

  it('πολύς: mult, multă, mulți, multe, multor; the genitives are filled in', () => {
    expect(roQuantifier(q('polys'), slot(), 'm')).toBe('mult');
    expect(roQuantifier(q('polys'), slot(), 'f')).toBe('multă');
    expect(roQuantifier(q('polys'), slot({ number: 'pl' }), 'm')).toBe('mulți');
    expect(roQuantifier(q('polys'), slot({ number: 'pl' }), 'f')).toBe('multe');
    expect(roQuantifier(q('polys'), slot({ number: 'pl', case: 'gen' }), 'f')).toBe('multor');
    expect(roQuantifier(q('polys'), slot({ case: 'gen' }), 'f')).toBe('multei');
    expect(roQuantifier(q('polys'), slot({ case: 'gen' }), 'm')).toBe('multului');
  });

  it('the comparative is mai + the plain form, also in the genitive', () => {
    expect(roQuantifier(q('polys'), slot({ degree: 'comparative' }), 'f')).toBe('mai multă');
    expect(roQuantifier(q('polys'), slot({ degree: 'comparative', number: 'pl', case: 'gen' }), 'm')).toBe('mai multor');
    expect(roQuantifier(q('polys'), slot({ degree: 'comparative', case: 'gen' }), 'm')).toBe('mai multului');
    expect(roQuantifier(q('ligos'), slot({ degree: 'comparative' }), 'f')).toBe('mai puțină');
  });

  it('λίγος: puțin, puțină, puțini, puține; with their genitives', () => {
    expect(roQuantifier(q('ligos'), slot(), 'm')).toBe('puțin');
    expect(roQuantifier(q('ligos'), slot(), 'f')).toBe('puțină');
    expect(roQuantifier(q('ligos'), slot({ number: 'pl' }), 'm')).toBe('puțini');
    expect(roQuantifier(q('ligos'), slot({ number: 'pl' }), 'f')).toBe('puține');
    expect(roQuantifier(q('ligos'), slot({ number: 'pl', case: 'gen' }), 'f')).toBe('puținelor');
    expect(roQuantifier(q('ligos'), slot({ case: 'gen' }), 'f')).toBe('puținei');
    expect(roQuantifier(q('ligos'), slot({ case: 'gen' }), 'm')).toBe('puținului');
  });

  it('a Romanian neuter follows the masculine in the singular and the feminine in the plural', () => {
    expect(roQuantifier(q('polys'), slot(), 'n')).toBe('mult');
    expect(roQuantifier(q('polys'), slot({ number: 'pl' }), 'n')).toBe('multe');
  });

  it('throws for a number the lexeme does not have', () => {
    expect(() => roQuantifier(q('kanenas'), slot({ number: 'pl' }), 'm')).toThrow(/no Romanian/);
  });
});

describe('English quantifier cells', () => {
  it.each([
    ['merikoi', { number: 'pl' }, 'some'],
    ['merikoi', { number: 'pl', sense: 'few' }, 'a few / several'],
    ['merikoi', { number: 'pl', sense: 'few', use: 'pronoun' }, 'a few'],
    ['kapoios', {}, 'some / any'],
    ['kapoios', { use: 'pronoun' }, 'someone / anyone'],
    ['kanenas', {}, 'no'],
    ['kanenas', { use: 'pronoun' }, 'none / no one'],
    ['polys', {}, 'much / a lot of'],
    ['polys', { number: 'pl' }, 'many / a lot of'],
    ['polys', { degree: 'comparative' }, 'more'],
    ['ligos', {}, 'little / a little'],
    ['ligos', { number: 'pl' }, 'few / a few'],
    ['ligos', { degree: 'comparative' }, 'less'],
    ['ligos', { degree: 'comparative', number: 'pl' }, 'fewer'],
  ] as const)('%s %j -> %s', (id, patch, expected) => {
    expect(enQuantifier(q(id), slot(patch))).toBe(expected);
  });

  it('κανένας names the word it takes after a negative verb', () => {
    expect(q('kanenas').en.negated).toBe('any');
    expect(q('polys').en.negated).toBeUndefined();
  });

  it('throws for a number the lexeme does not have', () => {
    expect(() => enQuantifier(q('kanenas'), slot({ number: 'pl' }))).toThrow(/no English/);
  });
});

describe('roBareNoun', () => {
  it.each([
    ['kafes', 'sg', 'nom', 'cafea'],
    ['kafes', 'pl', 'acc', 'cafele'],
    ['kafes', 'sg', 'gen', 'cafele'],
    ['kafes', 'pl', 'gen', 'cafele'],
    ['psomi', 'sg', 'acc', 'pâine'],
    ['psomi', 'pl', 'nom', 'pâini'],
    ['nero', 'sg', 'acc', 'apă'],
    ['skylos', 'sg', 'nom', 'câine'],
    ['skylos', 'sg', 'gen', 'câine'],
  ] as const)('%s %s %s -> %s', (id, number, c, expected) => {
    expect(roBareNoun(getNoun(id), number, c)).toBe(expected);
  });
});
