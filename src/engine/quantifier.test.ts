import { describe, expect, it } from 'vitest';
import { getLexeme } from '../data/lexemes';
import type { Case, Gender, Num, QuantifierDegree, SlotOf } from '../types';
import { inflect } from './greek';
import { isPending, storedText } from './stored';
import { offeredDegrees, offeredSenses, quantifierSlots } from './quantifier';
import { formText } from './segments';

const slot = (
  gender: Gender,
  number: Num,
  c: Case,
  degree: QuantifierDegree = 'plain',
): SlotOf<'quantifier'> => ({ pos: 'quantifier', gender, number, case: c, degree, use: 'determiner' });
const greek = (id: string, s: SlotOf<'quantifier'>) => formText(inflect(getLexeme(id), s));

describe('μερικοί (plural only)', () => {
  it.each([
    ['m', 'nom', 'μερικοί'], ['f', 'nom', 'μερικές'], ['n', 'nom', 'μερικά'],
    ['m', 'acc', 'μερικούς'], ['f', 'acc', 'μερικές'], ['n', 'acc', 'μερικά'],
    ['m', 'gen', 'μερικών'], ['f', 'gen', 'μερικών'], ['n', 'gen', 'μερικών'],
  ] as const)('%s %s -> %s', (g, c, expected) => {
    expect(greek('merikoi', slot(g, 'pl', c))).toBe(expected);
  });
  it('has no singular', () => {
    expect(() => inflect(getLexeme('merikoi'), slot('m', 'sg', 'nom'))).toThrow(/no sg form|not offered/);
  });
});

describe('κάποιος (singular only)', () => {
  it.each([
    ['m', 'nom', 'κάποιος'], ['f', 'nom', 'κάποια'], ['n', 'nom', 'κάποιο'],
    ['m', 'acc', 'κάποιον'], ['f', 'acc', 'κάποια'], ['n', 'acc', 'κάποιο'],
    ['m', 'gen', 'κάποιου'], ['f', 'gen', 'κάποιας'], ['n', 'gen', 'κάποιου'],
  ] as const)('%s %s -> %s', (g, c, expected) => {
    expect(greek('kapoios', slot(g, 'sg', c))).toBe(expected);
  });
  it('has no plural and no comparative', () => {
    expect(() => inflect(getLexeme('kapoios'), slot('m', 'pl', 'nom'))).toThrow();
    expect(() => inflect(getLexeme('kapoios'), slot('m', 'sg', 'nom', 'comparative'))).toThrow(/comparative/);
  });
});

describe('κανένας (singular only, like ένας)', () => {
  it.each([
    ['m', 'nom', 'κανένας'], ['f', 'nom', 'καμία'], ['n', 'nom', 'κανένα'],
    ['m', 'acc', 'κανέναν'], ['f', 'acc', 'καμία'], ['n', 'acc', 'κανένα'],
    ['m', 'gen', 'κανενός'], ['f', 'gen', 'καμίας'], ['n', 'gen', 'κανενός'],
  ] as const)('%s %s -> %s', (g, c, expected) => {
    expect(greek('kanenas', slot(g, 'sg', c))).toBe(expected);
  });
});

describe('πολύς and περισσότερος', () => {
  it.each([
    ['m', 'sg', 'nom', 'πολύς'], ['f', 'sg', 'nom', 'πολλή'], ['n', 'sg', 'nom', 'πολύ'],
    ['m', 'sg', 'acc', 'πολύ'], ['f', 'sg', 'acc', 'πολλή'], ['n', 'sg', 'acc', 'πολύ'],
    ['m', 'sg', 'gen', 'πολλού'], ['f', 'sg', 'gen', 'πολλής'], ['n', 'sg', 'gen', 'πολλού'],
    ['m', 'pl', 'nom', 'πολλοί'], ['f', 'pl', 'nom', 'πολλές'], ['n', 'pl', 'nom', 'πολλά'],
    ['m', 'pl', 'acc', 'πολλούς'], ['f', 'pl', 'acc', 'πολλές'], ['n', 'pl', 'acc', 'πολλά'],
    ['m', 'pl', 'gen', 'πολλών'], ['f', 'pl', 'gen', 'πολλών'], ['n', 'pl', 'gen', 'πολλών'],
  ] as const)('%s %s %s -> %s', (g, n, c, expected) => {
    expect(greek('polys', slot(g, n, c))).toBe(expected);
  });
  it.each([
    ['n', 'sg', 'acc', 'περισσότερο'], ['m', 'sg', 'nom', 'περισσότερος'], ['f', 'sg', 'nom', 'περισσότερη'],
    ['m', 'pl', 'nom', 'περισσότεροι'], ['n', 'pl', 'acc', 'περισσότερα'], ['m', 'sg', 'gen', 'περισσότερου'],
  ] as const)('comparative %s %s %s -> %s', (g, n, c, expected) => {
    expect(greek('polys', slot(g, n, c, 'comparative'))).toBe(expected);
  });
  it('the πολύς forms carry the two-stems note; the comparative does not', () => {
    expect(inflect(getLexeme('polys'), slot('n', 'sg', 'acc')).irregular?.rule).toBe('two-stems');
    expect(inflect(getLexeme('polys'), slot('n', 'sg', 'acc', 'comparative')).irregular).toBeUndefined();
  });
});

describe('λίγος and λιγότερος', () => {
  it.each([
    ['m', 'sg', 'nom', 'λίγος'], ['f', 'sg', 'nom', 'λίγη'], ['n', 'sg', 'acc', 'λίγο'],
    ['m', 'pl', 'nom', 'λίγοι'], ['f', 'pl', 'acc', 'λίγες'], ['n', 'pl', 'nom', 'λίγα'], ['m', 'pl', 'gen', 'λίγων'],
  ] as const)('%s %s %s -> %s', (g, n, c, expected) => {
    expect(greek('ligos', slot(g, n, c))).toBe(expected);
  });
  it.each([
    ['n', 'sg', 'acc', 'λιγότερο'], ['m', 'sg', 'nom', 'λιγότερος'], ['n', 'pl', 'nom', 'λιγότερα'],
  ] as const)('comparative %s %s %s -> %s', (g, n, c, expected) => {
    expect(greek('ligos', slot(g, n, c, 'comparative'))).toBe(expected);
  });
});

describe('what a quantifier offers', () => {
  const q = (id: string) => {
    const lexeme = getLexeme(id);
    if (lexeme.pos !== 'quantifier') throw new Error('not a quantifier');
    return lexeme;
  };
  it('degrees and senses come from the data', () => {
    expect(offeredDegrees(q('polys'))).toEqual(['plain', 'comparative']);
    expect(offeredDegrees(q('kanenas'))).toEqual(['plain']);
    expect(offeredSenses(q('merikoi'))).toEqual(['some', 'few']);
    expect(offeredSenses(q('polys'))).toEqual(['some']);
  });
  it('lists every slot: gender × number × role × degree × sense × use', () => {
    expect(quantifierSlots(q('merikoi'))).toHaveLength(36);
    expect(quantifierSlots(q('kapoios'))).toHaveLength(18);
    expect(quantifierSlots(q('kanenas'))).toHaveLength(18);
    expect(quantifierSlots(q('polys'))).toHaveLength(72);
    expect(quantifierSlots(q('ligos'))).toHaveLength(72);
  });
  it('only the few sense carries `sense` on the slot', () => {
    const slots = quantifierSlots(q('merikoi'));
    expect(slots.filter((s) => s.sense === 'few')).toHaveLength(18);
    expect(slots.filter((s) => s.sense === undefined)).toHaveLength(18);
  });
});

describe('Stored cells', () => {
  it('a pending cell has no text', () => {
    expect(storedText('mult')).toBe('mult');
    expect(storedText({ pending: true })).toBeNull();
    expect(isPending({ pending: true, note: 'not yet confirmed' })).toBe(true);
    expect(isPending('mult')).toBe(false);
  });
});
