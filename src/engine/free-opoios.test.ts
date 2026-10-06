import { describe, expect, it } from 'vitest';
import { LEXEMES, getLexeme } from '../data/lexemes';
import type { Case, Gender, GreekQuantifier, Num, SlotOf } from '../types';
import { validate } from '../validate/validate';
import { enQuantifier } from './english';
import { inflectQuantifier } from './greek';
import { quantifierSlots } from './quantifier';
import { roQuantifier } from './romanian';
import { formText } from './segments';

const q = getLexeme('free-opoios') as GreekQuantifier;
const slot = (gender: Gender, number: Num, c: Case, use: SlotOf<'quantifier'>['use'] = 'determiner'): SlotOf<'quantifier'> => ({
  pos: 'quantifier',
  gender,
  number,
  case: c,
  degree: 'plain',
  use,
});

describe('όποιος, the free relative', () => {
  it('is an unverified quantifier flagged free, offered as a subject or an object', () => {
    expect(q.free).toBe(true);
    expect(q.cases).toEqual(['nom', 'acc']);
    expect(q.verified).toEqual({ el: false, ro: false, en: false });
    expect(quantifierSlots(q)).toHaveLength(24);
    expect(quantifierSlots(q).every((s) => s.case !== 'gen' && s.register === undefined)).toBe(true);
  });

  it('declines like ποιος, with the stress on the first syllable', () => {
    const forms = [
      slot('m', 'sg', 'nom'), slot('f', 'sg', 'nom'), slot('n', 'sg', 'nom'), slot('m', 'sg', 'acc'), slot('f', 'sg', 'acc'), slot('n', 'sg', 'acc'),
      slot('m', 'pl', 'nom'), slot('f', 'pl', 'nom'), slot('n', 'pl', 'nom'), slot('m', 'pl', 'acc'), slot('f', 'pl', 'acc'), slot('n', 'pl', 'acc'),
    ].map((s) => formText(inflectQuantifier(q, s)));
    expect(forms).toEqual(['όποιος', 'όποια', 'όποιο', 'όποιον', 'όποια', 'όποιο', 'όποιοι', 'όποιες', 'όποια', 'όποιους', 'όποιες', 'όποια']);
  });

  it('Romanian says orice beside a noun and oricine on its own, whatever the gender', () => {
    for (const g of ['m', 'f'] as const) {
      for (const n of ['sg', 'pl'] as const) {
        expect(roQuantifier(q, slot(g, n, 'nom'), g)).toBe('orice');
        expect(roQuantifier(q, slot(g, n, 'acc', 'pronoun'), g)).toBe('oricine');
      }
    }
  });

  it('English says whichever beside a noun and whoever on its own', () => {
    expect(enQuantifier(q, slot('m', 'sg', 'nom'))).toBe('whichever');
    expect(enQuantifier(q, slot('m', 'pl', 'nom', 'pronoun'))).toBe('whoever');
  });

  it('validates, and wants the subject and object only', () => {
    expect(validate({ lexemes: LEXEMES, phrases: [] })).toEqual([]);
    const bad = { ...LEXEMES, 'free-opoios': { ...q, cases: undefined } };
    expect(validate({ lexemes: bad, phrases: [] })).toContain('lexeme free-opoios: a free relative offers the subject and object roles only');
  });
});
