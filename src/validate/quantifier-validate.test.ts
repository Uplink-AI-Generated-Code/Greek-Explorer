import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { GreekQuantifier, Phrase, Token } from '../types';
import { pendingCells, validate } from './validate';

const polys = LEXEMES.polys as GreekQuantifier;
const real = { lexemes: LEXEMES, phrases: PHRASES };

/** Phrase 1 with its numeral (token 1) replaced by a quantifier token that agrees with καφές. */
const withQuantifier = (lexeme: string, patch: Partial<Token> & { slot?: Token['slot'] } = {}): Phrase => ({
  ...PHRASES[0],
  tokens: PHRASES[0].tokens.map((t, i) =>
    i === 1
      ? {
          text: 'κανέναν',
          lexeme,
          slot: { pos: 'quantifier', gender: 'm', number: 'sg', case: 'acc', degree: 'plain', use: 'determiner' },
          agreesWith: 3,
          ...patch,
        }
      : t,
  ),
});
const errorsOf = (phrase: Phrase) => validate({ ...real, phrases: [phrase] });

describe('the pending report', () => {
  it('lists the six pending Romanian genitives', () => {
    expect(pendingCells(LEXEMES)).toEqual([
      'polys Romanian plain determiner m sg gen',
      'polys Romanian plain determiner f sg gen',
      'ligos Romanian plain determiner m sg gen',
      'ligos Romanian plain determiner m pl gen',
      'ligos Romanian plain determiner f sg gen',
      'ligos Romanian plain determiner f pl gen',
    ]);
  });

  it('accepts a pending cell and refuses an empty one', () => {
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
    const emptied: GreekQuantifier = {
      ...polys,
      ro: {
        ...polys.ro,
        plain: {
          ...polys.ro.plain,
          determiner: {
            ...polys.ro.plain.determiner,
            m: { ...polys.ro.plain.determiner.m, sg: { nom: '', gen: { pending: true } } },
          },
        },
      },
    };
    const errors = validate({ lexemes: { ...LEXEMES, polys: emptied }, phrases: [] });
    expect(errors.some((e) => e.includes('lexeme polys') && e.includes('empty Romanian m form'))).toBe(true);
  });

  it('refuses a determiner with no genitive, but allows a pronoun with none', () => {
    const noGenitive: GreekQuantifier = {
      ...polys,
      ro: {
        ...polys.ro,
        plain: {
          ...polys.ro.plain,
          determiner: {
            ...polys.ro.plain.determiner,
            m: { ...polys.ro.plain.determiner.m, sg: { nom: 'mult' } },
          },
        },
      },
    };
    const errors = validate({ lexemes: { ...LEXEMES, polys: noGenitive }, phrases: [] });
    expect(errors.some((e) => e.includes('no Romanian m determiner form in the genitive'))).toBe(true);
  });

  it('refuses a missing English cell', () => {
    const noEnglish: GreekQuantifier = {
      ...polys,
      en: { ...polys.en, plain: { ...polys.en.plain, determiner: { sg: 'much / a lot of' } } },
    };
    const errors = validate({ lexemes: { ...LEXEMES, polys: noEnglish }, phrases: [] });
    expect(errors.some((e) => e.includes('lexeme polys') && e.includes('no English'))).toBe(true);
  });
});

describe('quantifier tokens', () => {
  it('accepts a quantifier that agrees with its noun', () => {
    expect(errorsOf(withQuantifier('kanenas'))).toEqual([]);
  });

  it('reports a gender that differs from the noun', () => {
    expect(
      errorsOf(withQuantifier('kanenas', { slot: { pos: 'quantifier', gender: 'f', number: 'sg', case: 'acc', degree: 'plain', use: 'determiner' } })),
    ).toContain('ordering-hot-coffee token 1 (κανέναν): slot gender f differs from noun gender m');
  });

  it('reports a number that differs from the noun', () => {
    const errors = errorsOf(
      withQuantifier('polys', {
        text: 'πολλούς',
        slot: { pos: 'quantifier', gender: 'm', number: 'pl', case: 'acc', degree: 'plain', use: 'determiner' },
      }),
    );
    expect(errors).toContain('ordering-hot-coffee token 1 (πολλούς): the quantifier is pl but its noun is sg');
  });

  it('reports a text that is not the form', () => {
    expect(errorsOf(withQuantifier('kanenas', { text: 'κανένα' }))).toContain(
      'ordering-hot-coffee token 1 (κανένα): text differs from the form ("κανέναν")',
    );
  });

  it('reports a missing agreesWith', () => {
    expect(errorsOf(withQuantifier('kanenas', { agreesWith: undefined }))).toContain(
      'ordering-hot-coffee token 1 (κανέναν): quantifier needs agreesWith pointing at a noun',
    );
  });

  it('reports a sense or a degree the lexeme does not have', () => {
    const few = errorsOf(
      withQuantifier('polys', {
        text: 'πολύ',
        slot: { pos: 'quantifier', gender: 'm', number: 'sg', case: 'acc', degree: 'plain', sense: 'few', use: 'determiner' },
      }),
    );
    expect(few).toContain('ordering-hot-coffee token 1 (πολύ): polys has no "few" sense');
    const comparative = errorsOf(
      withQuantifier('kapoios', {
        text: 'κάποιον',
        slot: { pos: 'quantifier', gender: 'm', number: 'sg', case: 'acc', degree: 'comparative', use: 'determiner' },
      }),
    );
    expect(comparative.some((e) => e.includes('kapoios has no comparative degree'))).toBe(true);
  });
});
