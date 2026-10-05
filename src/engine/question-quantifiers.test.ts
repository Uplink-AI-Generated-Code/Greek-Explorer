import { describe, expect, it } from 'vitest';
import { getLexeme } from '../data/lexemes';
import type { Case, Gender, GreekQuantifier, Num, SlotOf } from '../types';
import { enQuantifier } from './english';
import { inflectQuantifier } from './greek';
import { offeredCases, quantifierSlots } from './quantifier';
import { roQuantifier } from './romanian';
import { formText } from './segments';

const q = (id: string) => getLexeme(id) as GreekQuantifier;
const slot = (g: Gender, n: Num, c: Case, patch: Partial<SlotOf<'quantifier'>> = {}): SlotOf<'quantifier'> => ({
  pos: 'quantifier', gender: g, number: n, case: c, degree: 'plain', use: 'determiner', ...patch,
});
const greek = (id: string, s: SlotOf<'quantifier'>) => formText(inflectQuantifier(q(id), s));

describe('ποιος', () => {
  it.each([
    ['m', 'sg', 'nom', 'ποιος'], ['f', 'sg', 'nom', 'ποια'], ['n', 'sg', 'nom', 'ποιο'],
    ['m', 'sg', 'acc', 'ποιον'], ['f', 'sg', 'acc', 'ποια'], ['n', 'sg', 'acc', 'ποιο'],
    ['m', 'pl', 'nom', 'ποιοι'], ['f', 'pl', 'nom', 'ποιες'], ['n', 'pl', 'nom', 'ποια'],
    ['m', 'pl', 'acc', 'ποιους'], ['f', 'pl', 'acc', 'ποιες'], ['n', 'pl', 'acc', 'ποια'],
  ] as const)('%s %s %s -> %s', (g, n, c, expected) => {
    expect(greek('poios', slot(g, n, c))).toBe(expected);
  });

  it('is cine on its own and care before a noun; English who and which', () => {
    expect(roQuantifier(q('poios'), slot('m', 'sg', 'nom', { use: 'pronoun' }), 'm')).toBe('cine');
    expect(roQuantifier(q('poios'), slot('n', 'sg', 'acc'), 'f')).toBe('care');
    expect(enQuantifier(q('poios'), slot('m', 'sg', 'nom', { use: 'pronoun' }))).toBe('who');
    expect(enQuantifier(q('poios'), slot('n', 'sg', 'acc'))).toBe('which');
  });
});

describe('πόσος', () => {
  it.each([
    ['m', 'sg', 'nom', 'πόσος'], ['f', 'sg', 'nom', 'πόση'], ['n', 'sg', 'acc', 'πόσο'],
    ['m', 'pl', 'nom', 'πόσοι'], ['f', 'pl', 'acc', 'πόσες'], ['n', 'pl', 'nom', 'πόσα'],
  ] as const)('%s %s %s -> %s', (g, n, c, expected) => {
    expect(greek('posos', slot(g, n, c))).toBe(expected);
  });

  it('is cât, câtă, câți, câte, and "how much" or "how many"', () => {
    expect(roQuantifier(q('posos'), slot('n', 'sg', 'acc'), 'f')).toBe('câtă');
    expect(roQuantifier(q('posos'), slot('n', 'sg', 'acc'), 'm')).toBe('cât');
    expect(roQuantifier(q('posos'), slot('m', 'pl', 'nom'), 'm')).toBe('câți');
    expect(roQuantifier(q('posos'), slot('f', 'pl', 'nom'), 'f')).toBe('câte');
    expect(enQuantifier(q('posos'), slot('n', 'sg', 'acc'))).toBe('how much');
    expect(enQuantifier(q('posos'), slot('n', 'pl', 'acc'))).toBe('how many');
  });
});

describe('the roles of a question word', () => {
  it('are the subject and the object only', () => {
    expect(offeredCases(q('poios'))).toEqual(['nom', 'acc']);
    expect(offeredCases(q('polys'))).toEqual(['nom', 'acc', 'gen']);
    expect(quantifierSlots(q('posos')).every((s) => s.case !== 'gen')).toBe(true);
    // 3 genders × 2 numbers × 2 roles × 2 uses
    expect(quantifierSlots(q('posos'))).toHaveLength(24);
  });
});
