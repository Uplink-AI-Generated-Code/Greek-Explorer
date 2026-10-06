import { describe, expect, it } from 'vitest';
import { getAdjective, getNoun } from '../data/lexemes';
import { RO_POSSESSIVES } from '../data/possessives';
import type { Case, Num, SlotOf } from '../types';
import { nounPhrase } from './agree';
import { enPossessive, greekPossessive, POSSESSORS, possessorKey, possessorValue, roPossessive } from './possessive';
import { richText } from './segments';

const of = (value: string): SlotOf<'possessive'> => POSSESSORS.find((p) => p.value === value)!.slot;
const phrase = (noun: string, who: string, number: Num = 'sg', c: Case = 'nom') => {
  const np = nounPhrase(getNoun(noun), number, c, { article: 'definite', possessor: of(who) });
  return { el: richText(np.el), ro: np.ro, en: np.en };
};

describe('the possessors', () => {
  it('Greek is the weak genitive pronoun, English the possessive adjective', () => {
    expect(POSSESSORS.map((p) => greekPossessive(p.slot))).toEqual(['μου', 'σου', 'του', 'της', 'μας', 'σας', 'τους']);
    expect(POSSESSORS.map((p) => enPossessive(p.slot))).toEqual(['my', 'your', 'his', 'her', 'our', 'your', 'their']);
  });

  it('a third-person singular possessor needs a gender', () => {
    expect(() => possessorKey({ pos: 'possessive', person: 3, number: 'sg' })).toThrow(/needs a gender/);
    expect(possessorKey(of('3sg-f'))).toBe('3sg.f');
    expect(possessorKey(of('3pl'))).toBe('3pl');
  });

  it('knows which of the seven a slot is', () => {
    expect(POSSESSORS.map((p) => possessorValue(p.slot))).toEqual(POSSESSORS.map((p) => p.value));
    expect(possessorValue(null)).toBe('1sg');
  });

  it('Romanian agrees with the possessed noun: meu, mea, mei, mele; the third person never changes', () => {
    const forms = (who: string) =>
      ['skylos', 'spiti', 'dromos'].flatMap((id) => (['sg', 'pl'] as const).map((n) => roPossessive(of(who), getNoun(id), n)));
    // câinele (m), casa (f), drumul (neuter: masculine singular, feminine plural)
    expect(forms('1sg')).toEqual(['meu', 'mei', 'mea', 'mele', 'meu', 'mele']);
    expect(forms('2sg')).toEqual(['tău', 'tăi', 'ta', 'tale', 'tău', 'tale']);
    expect(forms('1pl')).toEqual(['nostru', 'noștri', 'noastră', 'noastre', 'nostru', 'noastre']);
    expect(forms('2pl')).toEqual(['vostru', 'voștri', 'voastră', 'voastre', 'vostru', 'voastre']);
    expect(['3sg-m', '3sg-f', '3pl'].map((w) => forms(w)[0])).toEqual(['lui', 'ei', 'lor']);
    expect(new Set(forms('3pl'))).toEqual(new Set(['lor']));
  });

  it('the genitive of a feminine singular uses the plural form: casei mele', () => {
    expect(roPossessive(of('1sg'), getNoun('spiti'), 'sg', 'gen')).toBe('mele');
    expect(roPossessive(of('1sg'), getNoun('skylos'), 'sg', 'gen')).toBe('meu');
  });

  it('stores every Romanian form', () => {
    for (const entry of Object.values(RO_POSSESSIVES)) {
      const forms = typeof entry === 'string' ? [entry] : [entry.m.sg, entry.m.pl, entry.f.sg, entry.f.pl];
      expect(forms.every((f) => f !== '')).toBe(true);
    }
  });
});

describe('a noun phrase with a possessive', () => {
  it('keeps the article and puts the pronoun after the noun: το σπίτι μου, casa mea, my house', () => {
    expect(phrase('spiti', '1sg')).toEqual({ el: 'το σπίτι μου', ro: 'casa mea', en: 'my house' });
    expect(phrase('skylos', '2sg')).toEqual({ el: 'ο σκύλος σου', ro: 'câinele tău', en: 'your dog' });
    expect(phrase('paidi', '3sg-m')).toEqual({ el: 'το παιδί του', ro: 'copilul lui', en: 'his child' });
    expect(phrase('paidi', '3sg-f')).toEqual({ el: 'το παιδί της', ro: 'copilul ei', en: 'her child' });
  });

  it('the plural and the other cases follow the noun', () => {
    expect(phrase('skylos', '1pl', 'pl')).toEqual({ el: 'οι σκύλοι μας', ro: 'câinii noștri', en: 'our dogs' });
    expect(phrase('dromos', '1sg', 'pl')).toEqual({ el: 'οι δρόμοι μου', ro: 'drumurile mele', en: 'my roads' });
    expect(phrase('spiti', '1sg', 'sg', 'gen')).toEqual({ el: 'του σπιτιού μου', ro: 'casei mele', en: 'of my house' });
    expect(phrase('skylos', '3pl', 'sg', 'acc')).toEqual({ el: 'τον σκύλο τους', ro: 'câinele lor', en: 'their dog' });
  });

  it('adds the second accent when the stress is too far back: η θάλασσά μου', () => {
    expect(phrase('thalassa', '1sg')).toEqual({ el: 'η θάλασσά μου', ro: 'marea mea', en: 'my sea' });
    expect(phrase('thalassa', '1pl', 'pl')).toEqual({ el: 'οι θάλασσές μας', ro: 'mările noastre', en: 'our seas' });
    expect(phrase('thalassa', '2sg', 'sg', 'gen').el).toBe('της θάλασσάς σου');
  });

  it('adds none when the stress is close enough, or on the ending', () => {
    for (const [noun, who] of [['spiti', '1sg'], ['skylos', '1sg'], ['paidi', '1sg'], ['alepou', '1sg'], ['ora', '1sg']] as const) {
      const el = phrase(noun, who).el;
      expect(el.replace(/ μου$/, '')).toBe(richText(nounPhrase(getNoun(noun), 'sg', 'nom', { article: 'definite' }).el));
    }
  });

  it('the pronoun comes after the adjective and the noun: ο ζεστός καφές μου, cafeaua mea caldă', () => {
    const np = nounPhrase(getNoun('kafes'), 'sg', 'nom', { article: 'definite', possessor: of('1sg'), adjective: getAdjective('zestos') });
    expect({ el: richText(np.el), ro: np.ro, en: np.en }).toEqual({
      el: 'ο ζεστός καφές μου',
      ro: 'cafeaua mea caldă',
      en: 'my hot coffee',
    });
  });

  it('wants the definite article', () => {
    expect(() => nounPhrase(getNoun('spiti'), 'sg', 'nom', { article: 'one', possessor: of('1sg') })).toThrow(/definite article/);
    expect(() => nounPhrase(getNoun('spiti'), 'sg', 'nom', { possessor: of('1sg') })).toThrow(/definite article/);
  });
});
