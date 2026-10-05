import { describe, expect, it } from 'vitest';
import { DIVERGENCES } from '../data/divergences';
import { LEXEMES } from '../data/lexemes';
import type { Divergence } from '../types';
import { validate } from './validate';

const check = (divergences: Divergence[]) => validate({ lexemes: LEXEMES, phrases: [], divergences });
const note = (appliesTo: Divergence['appliesTo']): Divergence => ({
  id: 'x', appliesTo, point: 'x', el: 'x', ro: 'x', en: 'x', tag: 'same', level: 'core', verified: false,
});

describe('divergence notes in the validator', () => {
  it('accepts the real notes', () => {
    expect(check(DIVERGENCES)).toEqual([]);
  });

  it('reports an unknown lexeme in a list', () => {
    expect(check([note({ pos: 'quantifier', lexeme: ['poios', 'nope'] })])).toEqual(['divergence x: unknown lexeme "nope"']);
  });

  it('reports a lexeme of another part of speech', () => {
    expect(check([note({ pos: 'noun', lexeme: 'thelo' })])).toEqual(['divergence x: lexeme thelo is a verb, not a noun']);
  });
});
