import { describe, expect, it } from 'vitest';
import { DEF_ARTICLE, NUMERAL, getAdjective, getLexeme, getNoun } from '../data/lexemes';
import { inflect, inflectAdjective, inflectArticle, inflectNoun, inflectNumeral, inflectVerb } from './greek';

describe('inflectNoun (καφές, class masc-es)', () => {
  const kafes = getNoun('kafes');
  const cases = [
    { number: 'sg', case: 'nom', stem: 'καφ', ending: 'ές' },
    { number: 'sg', case: 'acc', stem: 'καφ', ending: 'έ' },
    { number: 'sg', case: 'gen', stem: 'καφ', ending: 'έ' },
    { number: 'pl', case: 'nom', stem: 'καφέδ', ending: 'ες' },
    { number: 'pl', case: 'acc', stem: 'καφέδ', ending: 'ες' },
    { number: 'pl', case: 'gen', stem: 'καφέδ', ending: 'ων' },
  ] as const;

  for (const c of cases) {
    it(`${c.number} ${c.case} -> ${c.stem}${c.ending}`, () => {
      expect(inflectNoun(kafes, { pos: 'noun', number: c.number, case: c.case })).toEqual({
        stem: c.stem,
        ending: c.ending,
      });
    });
  }
});

describe('inflectArticle (definite)', () => {
  const cases = [
    { gender: 'm', number: 'sg', case: 'acc', text: 'τον' },
    { gender: 'f', number: 'pl', case: 'acc', text: 'τις' },
    { gender: 'n', number: 'pl', case: 'nom', text: 'τα' },
    { gender: 'm', number: 'sg', case: 'gen', text: 'του' },
  ] as const;
  for (const c of cases) {
    it(`${c.gender} ${c.number} ${c.case} -> ${c.text}`, () => {
      expect(
        inflectArticle(DEF_ARTICLE, { pos: 'article', gender: c.gender, number: c.number, case: c.case }),
      ).toEqual({ stem: c.text, ending: '' });
    });
  }
});

describe('inflectNumeral (one)', () => {
  const cases = [
    { gender: 'm', case: 'acc', stem: 'ένα', ending: 'ν' },
    { gender: 'f', case: 'gen', stem: 'μία', ending: 'ς' },
    { gender: 'n', case: 'gen', stem: 'ενό', ending: 'ς' },
    { gender: 'f', case: 'nom', stem: 'μία', ending: '' },
  ] as const;
  for (const c of cases) {
    it(`${c.gender} ${c.case} -> ${c.stem}${c.ending}`, () => {
      expect(inflectNumeral(NUMERAL, { pos: 'numeral', value: 1, gender: c.gender, case: c.case })).toEqual({
        stem: c.stem,
        ending: c.ending,
      });
    });
  }
});

describe('inflectNumeral (2 to 5)', () => {
  const cases = [
    { value: 2, gender: 'f', case: 'gen', stem: 'δύο' },
    { value: 2, gender: 'm', case: 'nom', stem: 'δύο' },
    { value: 3, gender: 'm', case: 'acc', stem: 'τρεις' },
    { value: 3, gender: 'f', case: 'nom', stem: 'τρεις' },
    { value: 3, gender: 'n', case: 'nom', stem: 'τρία' },
    { value: 3, gender: 'f', case: 'gen', stem: 'τριών' },
    { value: 4, gender: 'f', case: 'nom', stem: 'τέσσερις' },
    { value: 4, gender: 'n', case: 'acc', stem: 'τέσσερα' },
    { value: 4, gender: 'm', case: 'gen', stem: 'τεσσάρων' },
    { value: 5, gender: 'n', case: 'gen', stem: 'πέντε' },
  ] as const;
  for (const c of cases) {
    it(`${c.value} ${c.gender} ${c.case} -> ${c.stem}`, () => {
      expect(
        inflectNumeral(NUMERAL, { pos: 'numeral', value: c.value, gender: c.gender, case: c.case }),
      ).toEqual({ stem: c.stem, ending: '' });
    });
  }
});

describe('inflectAdjective (ζεστός, stressed class)', () => {
  const zestos = getAdjective('zestos');
  const cases = [
    { gender: 'm', number: 'sg', case: 'acc', ending: 'ό' },
    { gender: 'f', number: 'sg', case: 'nom', ending: 'ή' },
    { gender: 'm', number: 'pl', case: 'nom', ending: 'οί' },
    { gender: 'n', number: 'pl', case: 'gen', ending: 'ών' },
    { gender: 'f', number: 'sg', case: 'gen', ending: 'ής' },
  ] as const;
  for (const c of cases) {
    it(`${c.gender} ${c.number} ${c.case} -> ζεστ${c.ending}`, () => {
      expect(
        inflectAdjective(zestos, { pos: 'adjective', gender: c.gender, number: c.number, case: c.case }),
      ).toEqual({ stem: 'ζεστ', ending: c.ending });
    });
  }
});

describe('inflectVerb (θέλω, -ω class, present active)', () => {
  const thelo = getLexeme('thelo');
  const verbSlot = (person: 1 | 2 | 3, number: 'sg' | 'pl') =>
    ({ pos: 'verb', person, number, mood: 'indicative', tense: 'present', voice: 'active' }) as const;

  it('1sg -> θέλω', () => {
    expect(inflect(thelo, verbSlot(1, 'sg'))).toEqual({ stem: 'θέλ', ending: 'ω' });
  });
  it('2sg -> θέλεις', () => {
    expect(inflect(thelo, verbSlot(2, 'sg'))).toEqual({ stem: 'θέλ', ending: 'εις' });
  });
  it('3sg -> θέλει', () => {
    expect(inflect(thelo, verbSlot(3, 'sg'))).toEqual({ stem: 'θέλ', ending: 'ει' });
  });
  it('1pl -> θέλουμε', () => {
    expect(inflect(thelo, verbSlot(1, 'pl'))).toEqual({ stem: 'θέλ', ending: 'ουμε' });
  });
  it('3pl -> θέλουν', () => {
    expect(inflect(thelo, verbSlot(3, 'pl'))).toEqual({ stem: 'θέλ', ending: 'ουν' });
  });
});

describe('inflect dispatcher', () => {
  it('routes a noun slot to the noun engine', () => {
    expect(inflect(getNoun('kafes'), { pos: 'noun', number: 'sg', case: 'acc' })).toEqual({
      stem: 'καφ',
      ending: 'έ',
    });
  });
  it('rejects a slot of the wrong part of speech', () => {
    expect(() => inflect(getNoun('kafes'), { pos: 'article', gender: 'm', number: 'sg', case: 'nom' })).toThrow(
      'slot article does not fit lexeme kafes (noun)',
    );
  });
});
