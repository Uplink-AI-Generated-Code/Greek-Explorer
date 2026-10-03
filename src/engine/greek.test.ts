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
      expect(inflectNoun(kafes, { pos: 'noun', number: c.number, case: c.case })).toMatchObject({
        stem: c.stem,
        ending: c.ending,
      });
    });
  }
});

describe('inflectNoun (more classes)', () => {
  const noun = (id: string) => getNoun(id);
  const forms = (id: string, number: 'sg' | 'pl', c: 'nom' | 'acc' | 'gen') => inflectNoun(noun(id), { pos: 'noun', number, case: c });

  it('σκύλος (masc-os)', () => {
    expect(forms('skylos', 'sg', 'nom')).toMatchObject({ stem: 'σκύλ', ending: 'ος' });
    expect(forms('skylos', 'sg', 'acc')).toMatchObject({ stem: 'σκύλ', ending: 'ο' });
    expect(forms('skylos', 'sg', 'gen')).toMatchObject({ stem: 'σκύλ', ending: 'ου' });
    expect(forms('skylos', 'pl', 'nom')).toMatchObject({ stem: 'σκύλ', ending: 'οι' });
    expect(forms('skylos', 'pl', 'acc')).toMatchObject({ stem: 'σκύλ', ending: 'ους' });
    expect(forms('skylos', 'pl', 'gen')).toMatchObject({ stem: 'σκύλ', ending: 'ων' });
  });

  it('αλεπού (fem-ou): the singular is invariable and the plural adds -δ-', () => {
    expect(forms('alepou', 'sg', 'nom')).toMatchObject({ stem: 'αλεπού', ending: '' });
    expect(forms('alepou', 'sg', 'acc')).toMatchObject({ stem: 'αλεπού', ending: '' });
    expect(forms('alepou', 'sg', 'gen')).toMatchObject({ stem: 'αλεπού', ending: 'ς' });
    expect(forms('alepou', 'pl', 'nom')).toMatchObject({ stem: 'αλεπούδ', ending: 'ες' });
    expect(forms('alepou', 'pl', 'gen')).toMatchObject({ stem: 'αλεπούδ', ending: 'ων' });
  });

  it('παιδί (neut-i)', () => {
    expect(forms('paidi', 'sg', 'nom')).toMatchObject({ stem: 'παιδ', ending: 'ί' });
    expect(forms('paidi', 'sg', 'gen')).toMatchObject({ stem: 'παιδ', ending: 'ιού' });
    expect(forms('paidi', 'pl', 'nom')).toMatchObject({ stem: 'παιδ', ending: 'ιά' });
    expect(forms('paidi', 'pl', 'gen')).toMatchObject({ stem: 'παιδ', ending: 'ιών' });
  });

  it('attaches an irregularity note only where the class has one', () => {
    expect(forms('kafes', 'sg', 'acc').irregular?.rule).toBe('drop-final-s');
    expect(forms('kafes', 'sg', 'nom').irregular).toBeUndefined();
    expect(forms('alepou', 'sg', 'nom').irregular?.rule).toBe('invariable-singular');
    expect(forms('alepou', 'pl', 'nom').irregular?.rule).toBe('plural-delta');
    expect(forms('paidi', 'pl', 'nom').irregular).toBeUndefined();
  });
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

describe('inflectAdjective (more classes)', () => {
  const adj = (id: string, gender: 'm' | 'f' | 'n', number: 'sg' | 'pl', c: 'nom' | 'acc' | 'gen') =>
    inflectAdjective(getAdjective(id), { pos: 'adjective', gender, number, case: c });

  it('γρήγορος (stem-stressed): endings carry no accent', () => {
    expect(adj('grigoros', 'm', 'sg', 'nom')).toEqual({ stem: 'γρήγορ', ending: 'ος' });
    expect(adj('grigoros', 'f', 'sg', 'nom')).toEqual({ stem: 'γρήγορ', ending: 'η' });
    expect(adj('grigoros', 'n', 'pl', 'nom')).toEqual({ stem: 'γρήγορ', ending: 'α' });
    expect(adj('grigoros', 'm', 'pl', 'acc')).toEqual({ stem: 'γρήγορ', ending: 'ους' });
    expect(adj('grigoros', 'f', 'sg', 'gen')).toEqual({ stem: 'γρήγορ', ending: 'ης' });
  });

  it('τεμπέλικος uses the same stem-stressed class', () => {
    expect(adj('tembelikos', 'm', 'sg', 'acc')).toEqual({ stem: 'τεμπέλικ', ending: 'ο' });
    expect(adj('tembelikos', 'm', 'pl', 'gen')).toEqual({ stem: 'τεμπέλικ', ending: 'ων' });
  });

  it('καφέ never changes, and says so', () => {
    for (const gender of ['m', 'f', 'n'] as const) {
      for (const number of ['sg', 'pl'] as const) {
        for (const c of ['nom', 'acc', 'gen'] as const) {
          expect(adj('kafe-adj', gender, number, c)).toMatchObject({ stem: 'καφέ', ending: '' });
        }
      }
    }
    expect(adj('kafe-adj', 'f', 'sg', 'nom').irregular?.rule).toBe('indeclinable');
    expect(adj('zestos', 'f', 'sg', 'nom').irregular).toBeUndefined();
  });
});

describe('inflect dispatcher', () => {
  it('routes a noun slot to the noun engine', () => {
    expect(inflect(getNoun('kafes'), { pos: 'noun', number: 'sg', case: 'acc' })).toMatchObject({
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
