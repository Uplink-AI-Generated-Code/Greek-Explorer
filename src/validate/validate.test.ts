import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import { PHRASES } from '../data/phrases';
import type { Link, Phrase, Token } from '../types';
import { validate } from './validate';

const real = { lexemes: LEXEMES, phrases: PHRASES };

/** A copy of phrase 1 with one token changed. */
const withToken = (index: number, patch: Partial<Token>): Phrase => ({
  ...PHRASES[0],
  tokens: PHRASES[0].tokens.map((t, i) => (i === index ? { ...t, ...patch } : t)),
});

describe('validate', () => {
  it('accepts the real data', () => {
    expect(validate(real)).toEqual([]);
  });

  it('reports an unknown lexeme', () => {
    expect(validate({ ...real, phrases: [withToken(3, { lexeme: 'nope' })] })).toContain(
      'ordering-hot-coffee token 3 (καφέ): unknown lexeme "nope"',
    );
  });

  it('reports a slot of the wrong part of speech', () => {
    const bad = withToken(3, { slot: { pos: 'article', gender: 'm', number: 'sg', case: 'acc' } });
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee token 3 (καφέ): slot is article but lexeme kafes is noun',
    );
  });

  it('reports a gloss link outside the phrase', () => {
    const bad: Phrase = {
      ...PHRASES[0],
      glosses: PHRASES[0].glosses.map((g, i) =>
        i === 0 ? { ...g, units: [...g.units, { text: 'extra', link: 9 }] } : g,
      ),
    };
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee gloss en/natural: unit "extra" links to missing token 9',
    );
  });

  it('reports an adjective that does not agree with its noun in gender', () => {
    const bad = withToken(2, { slot: { pos: 'adjective', gender: 'f', number: 'sg', case: 'acc' } });
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee token 2 (ζεστό): slot gender f differs from noun gender m',
    );
  });

  it('reports a missing agreesWith on an adjective', () => {
    const bad = withToken(2, { agreesWith: undefined });
    expect(validate({ ...real, phrases: [bad] })).toContain(
      'ordering-hot-coffee token 2 (ζεστό): adjective needs agreesWith pointing at a noun',
    );
  });

  it('reports an empty Romanian form on a lexeme', () => {
    const lexemes = {
      ...LEXEMES,
      kafes: {
        ...LEXEMES.kafes,
        ro: {
          lemma: 'cafea',
          gender: 'f',
          forms: {
            sg: { definite: '', indefinite: 'o cafea', genDefinite: 'cafelei', genIndefinite: 'unei cafele' },
            pl: { definite: 'cafelele', indefinite: 'cafele', genDefinite: 'cafelelor', genIndefinite: 'unor cafele' },
          },
          split: { sg: ['cafea', 'ua'], pl: ['cafele', 'le'] },
        },
      },
    } as typeof LEXEMES;
    expect(validate({ lexemes, phrases: PHRASES })).toContain('lexeme kafes: empty Romanian form sg.definite');
  });

  const withExtraUnit = (link: Link): Phrase => ({
    ...PHRASES[0],
    glosses: PHRASES[0].glosses.map((g, i) =>
      i === 0 ? { ...g, units: [...g.units, { text: 'extra', link }] } : g,
    ),
  });

  it('accepts a gloss link to a piece of an existing token', () => {
    expect(validate({ ...real, phrases: [withExtraUnit({ token: 0, piece: 0 })] })).toEqual([]);
  });

  it('reports a piece link to a missing token', () => {
    expect(validate({ ...real, phrases: [withExtraUnit({ token: 9, piece: 0 })] })).toContain(
      'ordering-hot-coffee gloss en/natural: unit "extra" links to missing token 9',
    );
  });

  it('reports a negative piece number', () => {
    expect(validate({ ...real, phrases: [withExtraUnit({ token: 0, piece: -1 })] })).toContain(
      'ordering-hot-coffee gloss en/natural: unit "extra" has an invalid piece -1',
    );
  });

  it('reports a phrase with no theme', () => {
    expect(validate({ ...real, phrases: [{ ...PHRASES[0], theme: '' }] })).toContain(
      'ordering-hot-coffee: missing theme',
    );
  });

  it('reports an empty Romanian or English form on a preposition', () => {
    const lexemes = {
      ...LEXEMES,
      pano: { ...LEXEMES.pano, ro: '' },
    } as typeof LEXEMES;
    expect(validate({ lexemes, phrases: PHRASES })).toContain('lexeme pano: empty Romanian form');
  });
});
