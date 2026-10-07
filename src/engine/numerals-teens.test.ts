import { describe, expect, it } from 'vitest';
import { NUMERAL, getNoun } from '../data/lexemes';
import { RO_ARTICLE_SUFFIX } from '../data/paradigms';
import type { Case, Gender, NumeralValue } from '../types';
import { nounPhrase } from './agree';
import { enNumeral } from './english';
import { inflectNumeral } from './greek';
import { roNumeral } from './romanian';
import { formText, richText } from './segments';

const greek = (value: NumeralValue, gender: Gender, c: Case) => formText(inflectNumeral(NUMERAL, { pos: 'numeral', value, gender, case: c }));

describe('13 and 14: three and four with δεκα- in front', () => {
  it('change with gender and case like 3 and 4: only the neuter differs, and the genitive is one form', () => {
    expect(['m', 'f', 'n'].map((g) => greek(13, g as Gender, 'nom'))).toEqual(['δεκατρείς', 'δεκατρείς', 'δεκατρία']);
    expect(['m', 'f', 'n'].map((g) => greek(13, g as Gender, 'acc'))).toEqual(['δεκατρείς', 'δεκατρείς', 'δεκατρία']);
    expect(['m', 'f', 'n'].map((g) => greek(13, g as Gender, 'gen'))).toEqual(['δεκατριών', 'δεκατριών', 'δεκατριών']);
    expect(['m', 'f', 'n'].map((g) => greek(14, g as Gender, 'nom'))).toEqual(['δεκατέσσερις', 'δεκατέσσερις', 'δεκατέσσερα']);
    expect(['m', 'f', 'n'].map((g) => greek(14, g as Gender, 'gen'))).toEqual(['δεκατεσσάρων', 'δεκατεσσάρων', 'δεκατεσσάρων']);
  });

  it('Romanian: treisprezece and paisprezece never change; English thirteen and fourteen', () => {
    for (const g of ['m', 'f', 'n'] as const) {
      expect(roNumeral(NUMERAL, 13, g, 'nom')).toBe('treisprezece');
      expect(roNumeral(NUMERAL, 14, g, 'nom')).toBe('paisprezece');
    }
    expect(roNumeral(NUMERAL, 13, 'f', 'gen')).toBe('treisprezece');
    expect([enNumeral(NUMERAL, 13), enNumeral(NUMERAL, 14)]).toEqual(['thirteen', 'fourteen']);
  });

  it('count a noun in three languages: δεκατρείς καφέδες, δεκατρία σπίτια', () => {
    const np = (noun: string, count: 13 | 14, c: Case = 'nom') => {
      const p = nounPhrase(getNoun(noun), 'pl', c, { count });
      return { el: richText(p.el), ro: p.ro, en: p.en };
    };
    expect(np('kafes', 13)).toEqual({ el: 'δεκατρείς καφέδες', ro: 'treisprezece cafele', en: 'thirteen coffees' });
    expect(np('spiti', 13)).toEqual({ el: 'δεκατρία σπίτια', ro: 'treisprezece case', en: 'thirteen houses' });
    expect(np('skylos', 14, 'gen')).toEqual({ el: 'δεκατεσσάρων σκύλων', ro: 'paisprezece câini', en: 'of fourteen dogs' });
    expect(np('thalassa', 14).el).toBe('δεκατέσσερις θάλασσες');
  });
});

describe('the Romanian article suffix of the feminine genitive', () => {
  it('is -ei or -ii (casei, vulpii, mării)', () => {
    expect(RO_ARTICLE_SUFFIX.sg.f.genitive).toBe('-ei / -ii');
  });
});
