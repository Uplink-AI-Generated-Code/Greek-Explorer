import { describe, expect, it } from 'vitest';
import { getNoun } from '../data/lexemes';
import { inflectNoun } from './greek';

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
