import { describe, expect, it } from 'vitest';
import { DEF_ARTICLE, ONE, getAdjective, getNoun } from '../data/lexemes';
import { inflectAdjective, inflectArticle, inflectNoun, inflectNumeral } from './greek';

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
      expect(inflectNumeral(ONE, { pos: 'numeral', value: 1, gender: c.gender, case: c.case })).toEqual({
        stem: c.stem,
        ending: c.ending,
      });
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
